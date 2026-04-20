// Mock Logseq API
import App from './app'
import Editor from './editor'
import UI from './ui'
import DB from './db'
import Git from './git'
import Utils from './utils'
import Assets from './assets'
import Request from './request'
import FileStorage from './fileStorage'
import Experiments from './experiments'
import { getSettings, updateSettings, onSettingsChanged } from './settings'

// 简单的 EventEmitter 实现
class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map()

  on(event: string, listener: (...args: any[]) => void) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)?.push(listener)
    return this
  }

  off(event: string, listener?: (...args: any[]) => void) {
    if (!this.events.has(event)) return this
    if (!listener) {
      this.events.delete(event)
    } else {
      const listeners = this.events.get(event)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index !== -1) {
          listeners.splice(index, 1)
        }
      }
    }
    return this
  }

  emit(event: string, ...args: any[]) {
    if (!this.events.has(event)) return false
    const listeners = this.events.get(event)
    listeners?.forEach(listener => listener(...args))
    return true
  }
}

// 模拟 baseInfo
const baseInfo = {
  id: 'logseq-text-toolkit',
  mode: 'iframe' as const,
  settings: {
    disabled: false
  },
  effect: true,
  iir: false,
  lsr: ''
}

const mockLogseq = Object.assign(new EventEmitter(), {
  // 基本属性
  connected: true,
  baseInfo,
  effect: true,
  logger: console,
  get settings() {
    const settings = getSettings()
    if (!('disabled' in settings)) {
      (settings as any).disabled = false
    }
    return settings
  },
  set settings(value) {
    updateSettings(value)
  },
  version: '0.2.12',
  isMainUIVisible: false,
  caller: {},

  // ready 方法
  ready: (modelOrCallback?: any, callback?: any) => {
    const promise = Promise.resolve()
    if (typeof modelOrCallback === 'function') {
      promise.then(modelOrCallback)
    } else if (typeof callback === 'function') {
      promise.then(callback)
      if (modelOrCallback) {
        mockLogseq.provideModel(modelOrCallback)
      }
    } else if (modelOrCallback) {
      mockLogseq.provideModel(modelOrCallback)
    }
    return promise
  },

  // beforeunload 方法
  beforeunload: (callback: () => Promise<void>) => {
    console.log('beforeunload callback registered')
    window.addEventListener('beforeunload', async (e) => {
      await callback()
    })
  },

  // provideModel 方法
  provideModel: (model: Record<string, any>) => {
    console.log('provideModel called with model:', model)
    Object.assign(globalThis, model)
    Object.assign(mockLogseq, model)
    return mockLogseq
  },

  // provideTheme 方法
  provideTheme: (theme: any) => {
    console.log('provideTheme called:', theme)
    return mockLogseq
  },

  // provideStyle 方法
  provideStyle: (style: any) => {
    console.log('provideStyle called:', style)
    return mockLogseq
  },

  // provideUI 方法
  provideUI: (ui: any) => {
    console.log('provideUI called:', ui)
    return mockLogseq
  },

  // useSettingsSchema 方法
  useSettingsSchema: (schemas: any[]) => {
    console.log('useSettingsSchema called:', schemas)
    return mockLogseq
  },

  // updateSettings 方法
  updateSettings: (attrs: Record<string, any>) => {
    console.log('updateSettings called:', attrs)
    updateSettings(attrs)
  },

  // onSettingsChanged 方法
  onSettingsChanged: <T = any>(cb: (a: T, b: T) => void) => {
    return onSettingsChanged(cb)
  },

  // showSettingsUI 方法
  showSettingsUI: () => {
    console.log('showSettingsUI called')
  },

  // hideSettingsUI 方法
  hideSettingsUI: () => {
    console.log('hideSettingsUI called')
  },

  // setMainUIAttrs 方法
  setMainUIAttrs: (attrs: any) => {
    console.log('setMainUIAttrs called:', attrs)
  },

  // setMainUIInlineStyle 方法
  setMainUIInlineStyle: (style: any) => {
    console.log('setMainUIInlineStyle called:', style)
  },

  // showMainUI 方法
  showMainUI: (opts?: any) => {
    console.log('showMainUI called:', opts)
    mockLogseq.isMainUIVisible = true
  },

  // hideMainUI 方法
  hideMainUI: (opts?: any) => {
    console.log('hideMainUI called:', opts)
    mockLogseq.isMainUIVisible = false
  },

  // toggleMainUI 方法
  toggleMainUI: () => {
    console.log('toggleMainUI called')
    mockLogseq.isMainUIVisible = !mockLogseq.isMainUIVisible
  },

  // resolveResourceFullUrl 方法
  resolveResourceFullUrl: (filePath: string) => {
    console.log('resolveResourceFullUrl called:', filePath)
    return filePath
  },

  // 各个 API 模块
  App,
  Editor,
  UI,
  DB,
  Git,
  Utils,
  Assets,
  Request,
  FileStorage,
  Experiments
} as any)

// 挂载到全局
globalThis.logseq = mockLogseq

export default mockLogseq
