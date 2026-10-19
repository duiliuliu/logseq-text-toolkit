import type { AIConfig, SummaryData } from './types';
import logger from '../logger';

const DEFAULT_PROMPT = `你是个人知识管理助手。请根据下面的统计摘要，用中文给出 3-5 条具体、可执行的回顾建议。
要求：每条一行；不要重复统计数字；不要编造不存在的任务；不要输出 Markdown 标题。
统计摘要：
{{data}}`;

function buildPrompt(data: SummaryData, template?: string): string {
  const stats = {
    dateRange: {
      start: data.dateRange.start.toISOString(),
      end: data.dateRange.end.toISOString(),
    },
    blocks: {
      total: data.blocks.total,
      created: data.blocks.created,
      modified: data.blocks.modified,
      avgContentLength: data.blocks.avgContentLength,
      topTags: Object.entries(data.blocks.tags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8),
    },
    tasks: data.tasks,
    pages: {
      total: data.pages.total,
      newPages: data.pages.newPages,
      modifiedPages: data.pages.modifiedPages,
    },
  };

  const prompt = template?.trim() || DEFAULT_PROMPT;
  const serialized = JSON.stringify(stats, null, 2);
  return prompt.includes('{{data}}')
    ? prompt.replace(/\{\{data\}\}/g, serialized)
    : `${prompt}\n\n统计摘要：\n${serialized}`;
}

function endpointFor(config: AIConfig): string {
  const base = (config.apiUrl || '').trim().replace(/\/+$/, '');

  if (config.provider === 'claude') {
    if (!base) return 'https://api.anthropic.com/v1/messages';
    if (base.endsWith('/messages')) return base;
    return base.endsWith('/v1') ? `${base}/messages` : `${base}/v1/messages`;
  }

  if (config.provider === 'custom') {
    if (!base) throw new Error('AI API URL is required for custom provider');
    if (/\/(chat\/completions|responses)$/.test(base)) return base;
    return base.endsWith('/v1') ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
  }

  // OpenAI-compatible
  if (!base) return 'https://api.openai.com/v1/chat/completions';
  if (base.endsWith('/chat/completions')) return base;
  return base.endsWith('/v1') ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
}

async function callAI(config: AIConfig, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  const endpoint = endpointFor(config);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let body: Record<string, any>;

  if (config.provider === 'claude') {
    headers['x-api-key'] = config.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    // Anthropic 默认拒绝浏览器直连；自定义/代理端点可去掉此限制。
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
    body = {
      model: config.model || 'claude-3-5-sonnet-latest',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    };
  } else {
    headers.Authorization = `Bearer ${config.apiKey}`;
    body = {
      model: config.model || 'gpt-3.5-turbo',
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: 'system', content: 'You write concise, actionable review suggestions.' },
        { role: 'user', content: prompt },
      ],
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`AI request failed: ${response.status} ${text.slice(0, 200)}`);
    }

    const json: any = await response.json();

    if (config.provider === 'claude') {
      return json?.content?.[0]?.text || '';
    }
    return json?.choices?.[0]?.message?.content
      || json?.choices?.[0]?.text
      || json?.output_text
      || json?.text
      || '';
  } finally {
    clearTimeout(timer);
  }
}

function splitSuggestions(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)、])\s*/, '').trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .slice(0, 6);
}

/**
 * 调用用户配置的 AI。任何失败都返回 []，由调用方回退到本地洞察。
 */
export async function buildAISuggestions(
  data: SummaryData,
  config?: AIConfig
): Promise<string[]> {
  if (!config?.enabled || !config.apiKey?.trim()) {
    return [];
  }

  if (typeof fetch !== 'function') {
    logger.warn('[Summary AI] fetch is not available in this host');
    return [];
  }

  try {
    const text = await callAI(config, buildPrompt(data, config.promptTemplate));
    const suggestions = splitSuggestions(text);
    if (suggestions.length === 0) {
      logger.warn('[Summary AI] Empty AI response');
    }
    return suggestions;
  } catch (error) {
    logger.warn('[Summary AI] Failed, falling back to local insights', error);
    return [];
  }
}
