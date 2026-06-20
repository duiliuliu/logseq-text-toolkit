/**
 * OpenAI 兼容接口 Provider
 * 支持 GPT-4o-mini / GPT-4o 等模型，同时兼容其它 OpenAI 风格 API（如 DeepSeek）
 */

import {
  AIProvider,
  AIProviderConfig,
  AIProviderType,
  AIGenerateOptions,
  AIGenerateResult,
} from '../types';

const DEFAULT_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';

export class OpenAIProvider extends AIProvider {
  getType(): AIProviderType {
    return 'openai';
  }

  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const start = Date.now();
    const url = `${this.config.apiUrl || DEFAULT_URL}/chat/completions`;
    const model = this.config.model || DEFAULT_MODEL;
    const timeout = this.config.timeoutMs || 30000;

    const prompt = buildPrompt(options, this.config.promptTemplate);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: '你是一名专业的个人生产力助手。' },
            { role: 'user', content: prompt },
          ],
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 1000,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => 'N/A');
        throw new Error(`OpenAI HTTP ${resp.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await resp.json()) as any;
      const content: string = data?.choices?.[0]?.message?.content?.trim() || '';

      return {
        content,
        provider: 'openai',
        model,
        usage: data.usage,
        durationMs: Date.now() - start,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

/** 构造提示词 */
function buildPrompt(options: AIGenerateOptions, tpl?: string): string {
  if (tpl && tpl.includes('{{input}}')) {
    return tpl.replaceAll('{{input}}', options.input);
  }
  // 默认提示词：面向周报的结构化摘要
  return `
根据以下统计数据，生成一份简洁的周报摘要，分为 4 个小节，每小节 1-3 点：

## 概览
（一句话整体总结）

## 亮点成就
（最值得关注的 2-3 项成就）

## 改进建议
（需要改善的 1-2 项）

## 下期行动
（下周最应关注的 2-3 个行动）

--- 数据 ---
${options.input}
`.trim();
}
