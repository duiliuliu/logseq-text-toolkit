/**
 * Custom Provider - 兼容 OpenAI 风格的任意自定义 API
 * 用户可配置任意 URL / 模型名称
 */

import {
  AIProvider,
  AIProviderType,
  AIGenerateOptions,
  AIGenerateResult,
} from '../types';

const DEFAULT_MODEL = 'custom-model';

export class CustomProvider extends AIProvider {
  getType(): AIProviderType {
    return 'custom';
  }

  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const start = Date.now();
    if (!this.config.apiUrl) {
      throw new Error('Custom provider 需要配置 apiUrl');
    }
    const model = this.config.model || DEFAULT_MODEL;
    const timeout = this.config.timeoutMs || 30000;

    const prompt = options.input;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const resp = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 1000,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => 'N/A');
        throw new Error(`Custom HTTP ${resp.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await resp.json()) as any;
      const content: string =
        data?.choices?.[0]?.message?.content?.trim() ||
        data?.response?.trim() ||
        '';

      return {
        content,
        provider: 'custom',
        model,
        usage: data.usage,
        durationMs: Date.now() - start,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
