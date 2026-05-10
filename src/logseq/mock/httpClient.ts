/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logseq HTTP API 客户端
 * 支持调用 Logseq HTTP API 进行读写操作
 */

import logger from '../../lib/logger';

export interface HTTPAPIConfig {
  baseUrl: string;
  token: string;
}

export interface APIRequest {
  method: string;
  args: any[];
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class LogseqHTTPClient {
  private config: HTTPAPIConfig | null = null;
  private enabled: boolean = false;

  setConfig(baseUrl: string, token: string): void {
    this.config = { baseUrl, token };
    this.enabled = true;
    logger.info('[HTTPClient] Configured with baseUrl:', baseUrl);
  }

  isEnabled(): boolean {
    return this.enabled && this.config !== null;
  }

  getConfig(): HTTPAPIConfig | null {
    return this.config;
  }

  disable(): void {
    this.enabled = false;
    logger.info('[HTTPClient] Disabled');
  }

  private async request(requestData: APIRequest): Promise<APIResponse> {
    if (!this.config || !this.enabled) {
      return { success: false, error: 'HTTP API not configured or disabled' };
    }

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('[HTTPClient] Request failed:', response.status, errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[HTTPClient] Request error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async callMethod(method: string, args: any[]): Promise<any> {
    logger.info(`[HTTPClient] Calling: ${method}`, args);

    const result = await this.request({ method, args });

    if (result.success) {
      return result.data;
    }

    throw new Error(result.error || 'Unknown error');
  }

  async getUserConfigs(): Promise<any> {
    return this.callMethod('logseq.App.getUserConfigs', []);
  }

  async getPage(pageName: string): Promise<any> {
    return this.callMethod('logseq.Editor.getPage', [pageName]);
  }

  async createPage(pageName: string, content: string = '', options?: any): Promise<any> {
    return this.callMethod('logseq.Editor.createPage', [pageName, content, options]);
  }

  async getBlock(blockUuid: string): Promise<any> {
    return this.callMethod('logseq.Editor.getBlock', [blockUuid]);
  }

  async updateBlock(blockUuid: string, content: string): Promise<any> {
    return this.callMethod('logseq.Editor.updateBlock', [blockUuid, content]);
  }

  async upsertBlockProperty(blockUuid: string, property: string, value: any): Promise<any> {
    return this.callMethod('logseq.Editor.upsertBlockProperty', [blockUuid, property, value]);
  }

  async renamePage(oldName: string, newName: string): Promise<any> {
    return this.callMethod('logseq.Editor.renamePage', [oldName, newName]);
  }

  async insertBlock(parentUuid: string, content: string, position: string = 'last'): Promise<any> {
    return this.callMethod('logseq.Editor.insertBlock', [parentUuid, content, position]);
  }

  async deleteBlock(blockUuid: string): Promise<any> {
    return this.callMethod('logseq.Editor.deleteBlock', [blockUuid]);
  }

  async addTag(blockUuid: string, tagName: string): Promise<any> {
    return this.callMethod('logseq.Editor.addTag', [blockUuid, tagName]);
  }

  async pushState(page: string, params: any): Promise<any> {
    logger.info(`[HTTPClient] pushState: ${page}`, params);
    return { success: true };
  }

  async executeQuery(query: string): Promise<any> {
    return this.callMethod('logseq.DB.q', [query]);
  }
}

export const httpClient = new LogseqHTTPClient();

export default httpClient;
