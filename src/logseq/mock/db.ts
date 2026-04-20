// Mock Logseq DB API

const eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map()

const DB: any = {
  q: (dsl: string) => {
    console.log('DB.q called', dsl)
    return Promise.resolve([])
  },
  customQuery: (query: string) => {
    console.log('DB.customQuery called', query)
    return Promise.resolve([])
  },
  datascriptQuery: (query: string, ...inputs: any[]) => {
    console.log('DB.datascriptQuery called', query, inputs)
    return Promise.resolve([])
  },
  onChanged: (callback: (...args: any[]) => void) => {
    console.log('DB.onChanged called')
    if (!eventListeners.has('changed')) {
      eventListeners.set('changed', [])
    }
    eventListeners.get('changed')?.push(callback)
    return () => {}
  },
  onBlockChanged: (uuid: string, callback: (...args: any[]) => void) => {
    console.log('DB.onBlockChanged called', uuid)
    return () => {}
  },
  setFileContent: (path: string, content: string) => {
    console.log('DB.setFileContent called', path)
    return Promise.resolve()
  },
  getFileContent: (path: string) => {
    console.log('DB.getFileContent called', path)
    return Promise.resolve(null)
  }
}

export default DB
