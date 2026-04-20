// Mock Logseq UI API
import { getDocument } from '../utils'

const UI: any = {
  // 显示消息
  showMsg: (content: string, status?: string, opts?: any) => {
    console.log('UI.showMsg called', content, status, opts)

    const type = status || 'info'
    const timeout = opts?.timeout || 3000

    if ((window as any).addToast) {
      (window as any).addToast(content, type, timeout)
    } else {
      createSimpleNotification(content, type, timeout)
    }

    return Promise.resolve(opts?.key || 'msg-' + Date.now())
  },

  // 关闭消息
  closeMsg: (key: string) => {
    console.log('UI.closeMsg called', key)
  },

  // 查询元素位置
  queryElementRect: (selector: string) => {
    console.log('UI.queryElementRect called', selector)
    const doc = getDocument()
    const el = doc.querySelector(selector)
    if (el) {
      const rect = el.getBoundingClientRect()
      return Promise.resolve({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom
      })
    }
    return Promise.resolve(null)
  },

  // 通过 ID 查询元素
  queryElementById: (id: string) => {
    console.log('UI.queryElementById called', id)
    const doc = getDocument()
    const el = doc.getElementById(id)
    return Promise.resolve(!!el)
  },

  // 检查插槽是否有效
  checkSlotValid: (slot: string) => {
    console.log('UI.checkSlotValid called', slot)
    return Promise.resolve(true)
  },

  // 解析主题 CSS 属性值
  resolveThemeCssPropsVals: (props: string | string[]) => {
    console.log('UI.resolveThemeCssPropsVals called', props)
    return Promise.resolve({})
  },

  // 显示对话框
  showDialog: (config: any) => {
    console.log('UI.showDialog called', config)
  },

  // 显示上下文菜单
  showContextMenu: (config: any) => {
    console.log('UI.showContextMenu called', config)
  }
}

// 创建简单通知
const createSimpleNotification = (msg: string, type: string, timeout: number) => {
  const doc = getDocument()
  const notification = doc.createElement('div')
  notification.className = `mock-notification mock-notification-${type}`
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
  `

  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#4CAF50'
      break
    case 'error':
      notification.style.backgroundColor = '#F44336'
      break
    case 'warning':
      notification.style.backgroundColor = '#FF9800'
      break
    default:
      notification.style.backgroundColor = '#2196F3'
  }

  notification.textContent = msg

  doc.body.appendChild(notification)

  const style = doc.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `
  doc.head.appendChild(style)

  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse'
    setTimeout(() => {
      if (doc.body.contains(notification)) {
        doc.body.removeChild(notification)
      }
      if (doc.head.contains(style)) {
        doc.head.removeChild(style)
      }
    }, 300)
  }, timeout)
}

export default UI
