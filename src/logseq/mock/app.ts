// Mock Logseq App API
import { getDocument } from '../utils'

const eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map()

const App: any = {
  // 获取应用信息
  getInfo: (key?: string) => {
    console.log('App.getInfo called', key)
    return Promise.resolve({
      version: '0.10.0',
      supportDb: true
    })
  },

  // 获取用户信息
  getUserInfo: () => {
    console.log('App.getUserInfo called')
    return Promise.resolve(null)
  },

  // 获取用户配置
  getUserConfigs: () => {
    console.log('App.getUserConfigs called')
    return Promise.resolve({
      preferredThemeMode: 'light',
      preferredFormat: 'markdown',
      preferredDateFormat: 'yyyy-MM-dd',
      preferredStartOfWeek: '1',
      preferredLanguage: 'zh-CN',
      preferredWorkflow: 'linear',
      currentGraph: 'test-graph',
      showBracket: true,
      enabledFlashcards: false,
      enabledJournals: true
    })
  },

  // 注册搜索服务
  registerSearchService: (service: any) => {
    console.log('App.registerSearchService called', service)
  },

  // 注册命令
  registerCommand: (type: string, opts: any, action?: any) => {
    console.log('App.registerCommand called', type, opts, action)
  },

  // 注册命令面板
  registerCommandPalette: (opts: any, action: any) => {
    console.log('App.registerCommandPalette called', opts, action)
  },

  // 注册命令快捷键
  registerCommandShortcut: (keybinding: any, action: any, opts?: any) => {
    console.log('App.registerCommandShortcut called', keybinding, action, opts)
  },

  // 调用外部命令
  invokeExternalCommand: (type: string, ...args: any[]) => {
    console.log('App.invokeExternalCommand called', type, args)
    return Promise.resolve()
  },

  // 调用外部插件
  invokeExternalPlugin: (type: string, ...args: any[]) => {
    console.log('App.invokeExternalPlugin called', type, args)
    return Promise.resolve()
  },

  // 获取外部插件
  getExternalPlugin: (pid: string) => {
    console.log('App.getExternalPlugin called', pid)
    return Promise.resolve(null)
  },

  // 从 store 获取状态
  getStateFromStore: <T = any>(path: string | string[]) => {
    console.log('App.getStateFromStore called', path)
    return Promise.resolve(null as T)
  },

  // 设置 store 状态
  setStateFromStore: (path: string | string[], value: any) => {
    console.log('App.setStateFromStore called', path, value)
    return Promise.resolve()
  },

  // 重启应用
  relaunch: () => {
    console.log('App.relaunch called')
    return Promise.resolve()
  },

  // 退出应用
  quit: () => {
    console.log('App.quit called')
    return Promise.resolve()
  },

  // 打开外部链接
  openExternalLink: (url: string) => {
    console.log('App.openExternalLink called', url)
    return Promise.resolve()
  },

  // 执行 Git 命令（已弃用）
  execGitCommand: (args: string[]) => {
    console.log('App.execGitCommand called', args)
    return Promise.resolve('')
  },

  // 获取当前图
  getCurrentGraph: () => {
    console.log('App.getCurrentGraph called')
    return Promise.resolve(null)
  },

  // 检查当前是否是 DB 图
  checkCurrentIsDbGraph: () => {
    console.log('App.checkCurrentIsDbGraph called')
    return Promise.resolve(false)
  },

  // 获取当前图配置
  getCurrentGraphConfigs: (...keys: string[]) => {
    console.log('App.getCurrentGraphConfigs called', keys)
    return Promise.resolve({})
  },

  // 设置当前图配置
  setCurrentGraphConfigs: (configs: any) => {
    console.log('App.setCurrentGraphConfigs called', configs)
    return Promise.resolve()
  },

  // 获取当前图收藏
  getCurrentGraphFavorites: () => {
    console.log('App.getCurrentGraphFavorites called')
    return Promise.resolve(null)
  },

  // 获取当前图最近访问
  getCurrentGraphRecent: () => {
    console.log('App.getCurrentGraphRecent called')
    return Promise.resolve(null)
  },

  // 获取当前图模板
  getCurrentGraphTemplates: () => {
    console.log('App.getCurrentGraphTemplates called')
    return Promise.resolve(null)
  },

  // 推送状态
  pushState: (k: string, params?: any, query?: any) => {
    console.log('App.pushState called', k, params, query)
  },

  // 替换状态
  replaceState: (k: string, params?: any, query?: any) => {
    console.log('App.replaceState called', k, params, query)
  },

  // 获取模板
  getTemplate: (name: string) => {
    console.log('App.getTemplate called', name)
    return Promise.resolve(null)
  },

  // 检查模板是否存在
  existTemplate: (name: string) => {
    console.log('App.existTemplate called', name)
    return Promise.resolve(false)
  },

  // 创建模板
  createTemplate: (target: any, name: string, opts?: any) => {
    console.log('App.createTemplate called', target, name, opts)
    return Promise.resolve()
  },

  // 删除模板
  removeTemplate: (name: string) => {
    console.log('App.removeTemplate called', name)
    return Promise.resolve()
  },

  // 插入模板
  insertTemplate: (target: any, name: string) => {
    console.log('App.insertTemplate called', target, name)
    return Promise.resolve()
  },

  // 设置缩放因子
  setZoomFactor: (factor: number) => {
    console.log('App.setZoomFactor called', factor)
  },

  // 设置全屏
  setFullScreen: (flag: boolean | 'toggle') => {
    console.log('App.setFullScreen called', flag)
  },

  // 设置左侧边栏可见性
  setLeftSidebarVisible: (flag: boolean | 'toggle') => {
    console.log('App.setLeftSidebarVisible called', flag)
  },

  // 设置右侧边栏可见性
  setRightSidebarVisible: (flag: boolean | 'toggle') => {
    console.log('App.setRightSidebarVisible called', flag)
  },

  // 清除右侧边栏块
  clearRightSidebarBlocks: (opts?: any) => {
    console.log('App.clearRightSidebarBlocks called', opts)
  },

  // 注册 UI 项
  registerUIItem: (slot: string, opts: any) => {
    console.log('App.registerUIItem called', slot, opts)
    const tryAddUIItem = () => {
      const doc = getDocument()
      const toolbarElement = doc.getElementById('toolbar')
      if (toolbarElement) {
        const existingElement = doc.getElementById(opts.key)
        if (existingElement) {
          existingElement.remove()
        }
        const element = doc.createElement('div')
        element.id = opts.key
        element.innerHTML = opts.template
        toolbarElement.appendChild(element)
        const clickableElements = element.querySelectorAll('[data-on-click]')
        clickableElements.forEach(clickable => {
          clickable.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            const functionName = clickable.getAttribute('data-on-click')
            if (functionName && typeof (globalThis as any)[functionName] === 'function') {
              (globalThis as any)[functionName]()
            }
          })
        })
        return true
      }
      return false
    }
    if (!tryAddUIItem()) {
      const observer = new MutationObserver((_, obs) => {
        if (tryAddUIItem()) {
          obs.disconnect()
        }
      })
      const doc = getDocument()
      observer.observe(doc.body, {
        childList: true,
        subtree: true
      })
      setTimeout(() => {
        observer.disconnect()
      }, 5000)
    }
  },

  // 注册页面菜单项
  registerPageMenuItem: (tag: string, action: any) => {
    console.log('App.registerPageMenuItem called', tag, action)
  },

  // 事件监听方法
  on: (event: string, callback: (...args: any[]) => void) => {
    console.log('App.on called', event)
    if (!eventListeners.has(event)) {
      eventListeners.set(event, [])
    }
    eventListeners.get(event)?.push(callback)

    if (event === 'selectionChange') {
      const doc = getDocument()
      doc.addEventListener('mouseup', () => {
        const selection = doc.getSelection()
        if (selection && selection.toString()) {
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          callback({
            text: selection.toString(),
            rect: {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height
            }
          })
        }
      })
    }

    return () => {
      App.off(event, callback)
    }
  },

  // 移除事件监听
  off: (event: string, callback?: (...args: any[]) => void) => {
    console.log('App.off called', event)
    if (callback && eventListeners.has(event)) {
      const listeners = eventListeners.get(event)
      if (listeners) {
        const index = listeners.indexOf(callback)
        if (index !== -1) {
          listeners.splice(index, 1)
        }
      }
    } else {
      eventListeners.delete(event)
    }
  },

  // 触发事件
  trigger: (event: string, ...args: any[]) => {
    console.log('App.trigger called', event, args)
    const listeners = eventListeners.get(event)
    listeners?.forEach(callback => callback(...args))
  },

  // 各种 onXxx 事件监听
  onCurrentGraphChanged: (callback: (...args: any[]) => void) => {
    return App.on('currentGraphChanged', callback)
  },

  onGraphAfterIndexed: (callback: (...args: any[]) => void) => {
    return App.on('graphAfterIndexed', callback)
  },

  onThemeModeChanged: (callback: (...args: any[]) => void) => {
    return App.on('themeModeChanged', callback)
  },

  onThemeChanged: (callback: (...args: any[]) => void) => {
    return App.on('themeChanged', callback)
  },

  onTodayJournalCreated: (callback: (...args: any[]) => void) => {
    return App.on('todayJournalCreated', callback)
  },

  onBeforeCommandInvoked: (condition: any, callback: (...args: any[]) => void) => {
    console.log('App.onBeforeCommandInvoked called', condition)
    return App.on('beforeCommandInvoked', callback)
  },

  onAfterCommandInvoked: (condition: any, callback: (...args: any[]) => void) => {
    console.log('App.onAfterCommandInvoked called', condition)
    return App.on('afterCommandInvoked', callback)
  },

  onBlockRendererSlotted: (condition: any, callback: (...args: any[]) => void) => {
    console.log('App.onBlockRendererSlotted called', condition)
    return App.on('blockRendererSlotted', callback)
  },

  onMacroRendererSlotted: (callback: (...args: any[]) => void) => {
    return App.on('macroRendererSlotted', callback)
  },

  onPageHeadActionsSlotted: (callback: (...args: any[]) => void) => {
    return App.on('pageHeadActionsSlotted', callback)
  },

  onRouteChanged: (callback: (...args: any[]) => void) => {
    return App.on('routeChanged', callback)
  },

  onSidebarVisibleChanged: (callback: (...args: any[]) => void) => {
    return App.on('sidebarVisibleChanged', callback)
  },

  // 内部方法
  _installPluginHook: (pid: string, hook: string, opts?: any) => {
    console.log('App._installPluginHook called', pid, hook, opts)
  },

  _uninstallPluginHook: (pid: string, hookOrAll: string | boolean) => {
    console.log('App._uninstallPluginHook called', pid, hookOrAll)
  }
}

export default App
