/**
 * Anthropic Claude Provider
 * 支持 claude-3-5-sonnet / claude-3-5-haiku 等
 */

import {
  AIProvider,
  AIProviderType,
  AIGenerateOptions,
  AIGenerateResult,
} from '../types';

const DEFAULT_URL = 'https://api.anthropic.com/v1';
const DEFAULT_MODEL = 'claude-3-5-sonnet-20240620';

export class ClaudeProvider extends AIProvider {
  getType(): AIProviderType {
    return 'claude';
  }

  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const start = Date.now();
    const url = `${this.config.apiUrl || DEFAULT_URL}/messages`;
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
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options.maxTokens ?? 1000,
          temperature: options.temperature ?? 0.3,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => 'N/A');
        throw new Error(`Claude HTTP ${resp.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await resp.json()) as any;
      const parts = data?.content || [];
      const content: string = parts
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n')
        .trim();

      return {
        content,
        provider: 'claude',
        model,
        usage: data.usage,
        durationMs: Date.now() - start,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

function buildPrompt(options: AIGenerateOptions, tpl?: string): string {
  if (tpl && tpl.includes('{{input}}')) {
    return tpl.replaceAll('{{input}}', options.input);
  }
  return `
根据以下统计数据，生成一份简洁的周报摘要，分为 4 个小节：

## 概览
## 亮点成就
## 改进建议
## 下期行动

--- 数据 ---
${options.input}
`.trim();
}
