/**
 * 🤖 AIService - AI 摘要统一服务层
 *
 * 职责：
 *   1. 读取 settings 中的 AI 配置
 *   2. 根据 provider 类型选择对应实现
 *   3. 提供高层 API（例如 generateSummaryInsights）
 *   4. 错误降级（未配置 / 失败时返回空）
 *   5. 简单的内存缓存（避免重复请求）
 */

import {
  AIProvider,
  AIProviderConfig,
  AIProviderType,
  AIGenerateOptions,
  AIGenerateResult,
  AISummaryInsights,
} from './types';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { CustomProvider } from './providers/CustomProvider';
import { getSettingsWithSystem } from '../../settings';
import logger from '../logger';

/**
 * ⚠️ 简易内存缓存 —— 以 JSON.stringify(data) 做 key
 * 最大缓存 5 条，避免重复请求
 */
const CACHE = new Map<string, AISummaryInsights>();
const CACHE_MAX = 5;

export class AIService {
  private provider: AIProvider | null = null;
  private providerType: AIProviderType | null = null;

  constructor(provider?: AIProvider) {
    if (provider) {
      this.provider = provider;
      this.providerType = provider.getType();
    }
  }

  /** 单例：从 settings 懒加载 provider */
  static async fromSettings(): Promise<AIService> {
    const settings = await getSettingsWithSystem();
    const aiCfg = settings?.summary?.ai;
    if (!aiCfg || !aiCfg.enabled || !aiCfg.apiKey) {
      return new AIService(); // 未配置 -> provider=null
    }

    const cfg: AIProviderConfig = {
      apiKey: aiCfg.apiKey,
      apiUrl: aiCfg.apiUrl,
      model: aiCfg.model,
      promptTemplate: aiCfg.promptTemplate,
    };

    const provider = buildProvider(aiCfg.provider, cfg);
    return new AIService(provider);
  }

  isEnabled(): boolean {
    return !!this.provider && this.provider.isConfigured();
  }

  /** 直接调用 provider（原始调用） */
  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    if (!this.provider) throw new Error('AIService: provider 未配置');
    return this.provider.generate(options);
  }

  /**
   * 🚀 生成结构化摘要
   * @param textData 统计数据（SummaryData的文本表示
   */
  async generateSummaryInsights(
    textData: string,
  ): Promise<AISummaryInsights> {
    if (!this.isEnabled()) {
      logger.info('[AIService] AI 未启用，返回空 insights');
      return emptyInsights();
    }

    // ---- 简易缓存：避免重复请求
    const cacheKey = textData.slice(0, 200);
    const cached = CACHE.get(cacheKey);
    if (cached) {
      logger.info('[AIService] 命中缓存');
      return cached;
    }

    logger.info(`[AIService] 调用 provider=${this.providerType}`);

    try {
      const result = await this.generate({ input: textData });
      const parsed = parseStructuredOutput(result.content);
      CACHE.set(cacheKey, parsed);
      trimCache();
      return parsed;
    } catch (err) {
      logger.error('[AIService] 生成失败', err);
      return emptyInsights();
    }
  }
}

// =====================================================================
// 辅助
// =====================================================================

function buildProvider(type: AIProviderType, cfg: AIProviderConfig): AIProvider {
  switch (type) {
    case 'openai':
      return new OpenAIProvider(cfg);
    case 'claude':
      return new ClaudeProvider(cfg);
    default:
      return new CustomProvider(cfg);
  }
}

/** 解析 LLM 返回的结构化输出为 AISummaryInsights */
function parseStructuredOutput(content: string): AISummaryInsights {
  if (!content) return emptyInsights();

  const sections: Record<string, string[]> = {};
  let current: string | null = null;

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = /^(#{1,6}\s+)?(.+?)\s*$/.exec(line)?.[2];
    if (heading && /概览|亮点|改进|行动/.test(heading)) {
      current = heading;
      sections[current] = sections[current] || [];
      continue;
    }

    if (current) {
      // 去掉行首的 bullet 标记
      const clean = line.replace(/^[-•●*\s]+/, '').trim();
      sections[current].push(clean);
    }
  }

  const overview = sections['概览'] || [];
  return {
    overview: overview[0] || '',
    highlights: sections['亮点成就'] || sections['亮点'] || [],
    improvements: sections['改进建议'] || sections['改进'] || [],
    nextActions: sections['下期行动'] || sections['行动'] || [],
  };
}

function emptyInsights(): AISummaryInsights {
  return {
    overview: '',
    highlights: [],
    improvements: [],
    nextActions: [],
  };
}

function trimCache() {
  if (CACHE.size > CACHE_MAX) {
    const firstKey = CACHE.keys().next().value;
    if (firstKey) CACHE.delete(firstKey);
  }
}
