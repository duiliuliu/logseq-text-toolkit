/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Logseq API 客户端 - 用于连接本地 Logseq 服务器
 * 参考: https://github.com/kerim/logseq-db-query-builder
 */

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
        throw new Error('Invalid API token. Check your token in Logseq settings.')
      }

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `API error: ${response.status}`)
      }

      return await response.json()
    } catch (error: any) {
      if (error.message.includes('Invalid API token')) {
        throw error
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to Logseq. Make sure the API server is enabled in Logseq settings.')
      }
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
        const graphName = result.name || result.url.split('/').pop()
        return { connected: true, graphName, error: null }
      }
      return { connected: true, graphName: 'Unknown', error: null }
    } catch (error: any) {
      const msg = error.message || ''
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
      console.error('Query execution failed:', error)
      throw error
    }
  }

  async queryTasksByBlockUuid(blockUuid: string, nestingLevel: number = 1, onlyLeaves: boolean = false): Promise<TaskProgressData[]> {
    // 构建嵌套查询
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

    const taskFilterClause = `
      (or-join [?b]
        (and [?b :block/tags ?t]
             [?t :block/title "Task"])
        (or-join [?b]
          [?b :logseq.property/status ?status]
        )
      )
    `

    const query = `
      [:find (pull ?b [:block/uuid :block/title :block/properties :block/tags :logseq.property/status])
       :where
       ${parentClause}
       ${nestingClauses}
       ${leafClause}
       ${taskFilterClause}
      ]
    `

    const result = await this.executeQuery(query)

    return result.data.map((item: any) => ({
      uuid: item['block/uuid'] || item.uuid,
      title: item['block/title'] || item.title || '',
      status: item['logseq.property/status'] || item['block/properties']?.status || item.status || 'todo',
      properties: item['block/properties'] || item.properties || {}
    }))
  }

  async queryBlockByUuid(blockUuid: string): Promise<any> {
    const query = `
      [:find (pull ?b [*])
       :where
       [?b :block/uuid #uuid "${blockUuid}"]
      ]
    `

    const result = await this.executeQuery(query)
    if (result.data.length > 0) {
      return this._normalizeKeys(result.data[0])
    }
    return null
  }
}

export const logseqAPI = new LogseqAPI()

export default LogseqAPI
