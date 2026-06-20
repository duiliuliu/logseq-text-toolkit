/**
 * 🤖 AI 摘要增强 - 核心类型定义
 *
 * Provider 模型:
 *   AIProvider (抽象)
 *     ├─ OpenAIProvider
 *     ├─ ClaudeProvider
 *     └─ CustomProvider
 *
 * AIService 负责:
 *   • 读取用户配置
 *   • 选择合适的 Provider
 *   • 统一调用接口
 *   • 错误降级与缓存
 */

// =====================================================================
// Provider 配置
// =====================================================================

export type AIProviderType = 'openai' | 'claude' | 'custom';

export interface AIProviderConfig {
  /** API Key - 必填 */
  apiKey: string;
  /** API 基础地址 - 非必填（Claude/OpenAI 有默认值） */
  apiUrl?: string;
  /** 模型名称 - 例如 gpt-4o-mini, claude-3-5-sonnet */
  model?: string;
  /** 自定义提示词模板 - 支持 {{input}} 占位符 */
  promptTemplate?: string;
  /** 请求超时(ms) - 默认 30000 */
  timeoutMs?: number;
}

// =====================================================================
// 请求 / 响应
// =====================================================================

export interface AIGenerateOptions {
  /** 用户输入的结构化数据（例如 Summary 的统计信息） */
  input: string;
  /** 期望的最大 token 数 */
  maxTokens?: number;
  /** 采样温度 - 0~1 */
  temperature?: number;
  /** 用户偏好的输出风格，例如 'formal' / 'casual' */
  style?: string;
}

export interface AIGenerateResult {
  /** 生成的文本内容 */
  content: string;
  /** 来源 provider */
  provider: AIProviderType;
  /** 使用的模型 */
  model: string;
  /** token 用量（如可用） */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  /** 请求耗时(ms) */
  durationMs: number;
}

export interface AISummaryInsights {
  /** 简短的总结（2~3 句） */
  overview: string;
  /** 亮点 / 关键成就（每条一行） */
  highlights: string[];
  /** 待改进 / 建议 */
  improvements: string[];
  /** 下周 / 下期的行动建议 */
  nextActions: string[];
}

// =====================================================================
// Provider 抽象接口
// =====================================================================

export abstract class AIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  /** Provider 名称，用于日志与回显 */
  abstract getType(): AIProviderType;

  /**
   * 生成文本
   */
  abstract generate(options: AIGenerateOptions): Promise<AIGenerateResult>;

  /**
   * 检查配置是否可用
   */
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}
