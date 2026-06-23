/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Logseq API 客户端 - 用于连接本地 Logseq 服务器
 * 参考: https://github.com/kerim/logseq-db-query-builder
 */

import logger from '../../lib/logger';

const API_BASE_URL = 'http://127.0.0.1:12315/api'

export interface HealthStatus {
  connected: boolean
  graphName: string | null
  error: 'invalid_token' | 'connection_refused' | null
}

export interface QueryResult {
  success: boolean
  data: any[]
  raw?: any
}

export interface TaskProgressData {
  uuid: string
  title: string
  status: string
  properties?: Record<string, any>
}

class LogseqAPI {
  private token: string = ''
  private baseUrl: string = API_BASE_URL

  constructor(token: string = '') {
    this.token = token
  }

  setToken(token: string): void {
    this.token = token
  }

  getToken(): string {
    return this.token
  }

  private async _callAPI(method: string, args: any[] = []): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ method, args })
      })

      if (response.status === 401) {
        let errorMessage = 'Invalid API token. Check your token in Logseq settings.'
        try {
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = `${errorMessage} (${errorData.message})`
          }
        } catch {
          // ignore JSON parse error
        }
        logger.error(`[logseqAPI] ${errorMessage}`);
        throw new Error(errorMessage)
      }

      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`
        try {
          const text = await response.text()
          if (text) {
            errorMessage = text
          } else {
            const errorData = await response.json()
            if (errorData && errorData.message) {
              errorMessage = errorData.message
            }
          }
        } catch {
          // ignore JSON parse error
        }
        logger.error(`[logseqAPI] ${errorMessage}`);
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error: any) {
      if (error.message && error.message.includes('Invalid API token')) {
        throw error
      }
      if (error.name === 'TypeError' && error.message && error.message.includes('fetch')) {
        const connError = 'Cannot connect to Logseq. Make sure the API server is enabled in Logseq settings.'
        logger.error(`[logseqAPI] ${connError}`);
        throw new Error(connError)
      }
      logger.error(`[logseqAPI] API call failed for method "${method}":`, error);
      throw error
    }
  }

  private _resolveIdent(val: any): any {
    if (typeof val === 'string') return val
    if (val && typeof val === 'object') return val['db/ident'] || val[':db/ident'] || val['ident'] || val
    return val
  }

  private _normalizeKeys(obj: any): any {
    if (obj === null || obj === undefined) return obj
    if (Array.isArray(obj)) return obj.map(item => this._normalizeKeys(item))
    if (typeof obj !== 'object') return obj

    const normalized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = key.startsWith(':') ? key.slice(1) : key
      normalized[cleanKey] = this._normalizeKeys(value)
    }
    return normalized
  }

  async checkHealth(): Promise<HealthStatus> {
    try {
      const result = await this._callAPI('logseq.App.getCurrentGraph', [])
      if (result && (result.name || result.url)) {
        let graphName = 'Unknown'
        if (result.name) {
          graphName = result.name
        } else if (result.url && typeof result.url === 'string') {
          const urlParts = result.url.split('/')
          graphName = urlParts[urlParts.length - 1] || 'Unknown'
        }
        return { connected: true, graphName, error: null }
      }
      return { connected: true, graphName: 'Unknown', error: null }
    } catch (error: any) {
      const msg = error?.message || ''
      if (msg.includes('Invalid API token')) {
        return { connected: false, graphName: null, error: 'invalid_token' }
      }
      return { connected: false, graphName: null, error: 'connection_refused' }
    }
  }

  async executeQuery(query: string): Promise<QueryResult> {
    try {
      const apiQuery = query.trim()
      const results = await this._callAPI('logseq.DB.datascriptQuery', [apiQuery])

      let data: any[] = []
      if (Array.isArray(results)) {
        data = results.map(r => {
          if (Array.isArray(r) && r.length === 1) {
            const val = r[0]
            return (typeof val === 'object' && val !== null) ? this._normalizeKeys(val) : val
          }
          return this._normalizeKeys(r)
        })
      }

      return {
        success: true,
        data: data,
        raw: results
      }
    } catch (error) {
      logger.error('[logseqAPI] Query execution failed:', error)
      throw error
    }
  }

  async queryTasksByBlockUuid(blockUuid: string, nestingLevel: number = 1, onlyLeaves: boolean = false): Promise<TaskProgressData[]> {
    const parentClause = `[?p :block/uuid #uuid "${blockUuid}"]`
    
    let nestingClauses = ''
    switch (nestingLevel) {
      case 1:
        nestingClauses = `[?b :block/parent ?p]`
        break
      case 2:
        nestingClauses = `
          (or-join [?p ?b]
            [?b :block/parent ?p]
            (and [?m1 :block/parent ?p] [?b :block/parent ?m1])
          )
        `
        break
      case 3:
        nestingClauses = `
          (or-join [?p ?b]
            [?b :block/parent ?p]
            (and [?m1 :block/parent ?p] [?b :block/parent ?m1])
            (and [?m1 :block/parent ?p] [?m2 :block/parent ?m1] [?b :block/parent ?m2])
          )
        `
        break
      default:
        nestingClauses = `
          (or-join [?p ?b]
            [?b :block/parent ?p]
            (and [?m1 :block/parent ?p] [?b :block/parent ?m1])
            (and [?m1 :block/parent ?p] [?m2 :block/parent ?m1] [?b :block/parent ?m2])
            (and [?m1 :block/parent ?p] [?m2 :block/parent ?m1] [?m3 :block/parent ?m2] [?b :block/parent ?m3])
            (and [?m1 :block/parent ?p] [?m2 :block/parent ?m1] [?m3 :block/parent ?m2] [?m4 :block/parent ?m3] [?b :block/parent ?m4])
          )
        `
        break
    }

    const leafClause = onlyLeaves ? `(not [?child :block/parent ?b])` : ''

    const query = `
      [:find (pull ?b [:block/uuid :block/title :block/properties :block/tags]) ?status-title
       :where
       ${parentClause}
       ${nestingClauses}
       ${leafClause}
       (or-join [?b]
         (and [?b :block/tags ?t]
              [?t :block/title "Task"])
         (or-join [?b]
           [?b :logseq.property/status ?status]
         )
       )
       [?b :logseq.property/status ?status]
       [?status :block/title ?status-title]
      ]
    `

    const result = await this.executeQuery(query)

    const tasks: TaskProgressData[] = []
    
    for (const item of (result.data || [])) {
      if (!item || !Array.isArray(item) || item.length < 2) continue
      
      const block = item[0]
      const statusTitle = item[1] // 直接从查询结果获取状态名称
      
      if (!block || typeof block !== 'object') continue

      let status = statusTitle ? statusTitle.toLowerCase() : 'todo'

      tasks.push({
        uuid: block['block/uuid'] || block.uuid || '',
        title: block['block/title'] || block.title || block.content || '',
        status: status,
        properties: block['block/properties'] || block.properties || {}
      })
    }

    return tasks
  }

  async queryBlockByUuid(blockUuid: string): Promise<any> {
    const query = `
      [:find (pull ?b [*])
       :where
       [?b :block/uuid #uuid "${blockUuid}"]
      ]
    `

    const result = await this.executeQuery(query)
    if (result.data && result.data.length > 0) {
      return this._normalizeKeys(result.data[0])
    }
    return null
  }

  async getAllPages(): Promise<{ name: string }[]> {
    try {
      const result = await this._callAPI('logseq.Editor.getAllPages', []);
      if (result && Array.isArray(result)) {
        return result.map((page: any) => ({
          name: page.name || page['page/name'] || page.title || ''
        })).filter((p: any) => p.name);
      }
      return [];
    } catch (error) {
      console.error('Error getting all pages:', error);
      return [];
    }
  }

  async createPage(pageName: string, content: string): Promise<{ name: string }> {
    const args = [
      pageName,
      {
        content: content,
        createFirstBlock: true
      }
    ];

    await this._callAPI('logseq.Editor.createPage', args);
    return { name: pageName };
  }

  async getPage(pageName: string): Promise<any> {
    try {
      const result = await this._callAPI('logseq.Editor.getPage', [pageName]);
      return result;
    } catch (error) {
      return null;
    }
  }

  async pushState(pageName: string): Promise<void> {
    await this._callAPI('logseq.App.pushState', ['page', { name: pageName }]);
  }

  async showMsg(message: string, type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    await this._callAPI('logseq.UI.showMsg', [message, type]);
  }
}

export const logseqAPI = new LogseqAPI()

export default LogseqAPI