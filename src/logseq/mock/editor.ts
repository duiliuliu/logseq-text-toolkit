// Mock Logseq Editor API
import { getSelection, getDocument } from '../utils'

const Editor: any = {
  // 注册斜杠命令
  registerSlashCommand: (tag: string, action: any) => {
    console.log('Editor.registerSlashCommand called', tag, action)
  },

  // 注册块上下文菜单项
  registerBlockContextMenuItem: (label: string, action: any) => {
    console.log('Editor.registerBlockContextMenuItem called', label, action)
  },

  // 注册高亮上下文菜单项
  registerHighlightContextMenuItem: (label: string, action: any, opts?: any) => {
    console.log('Editor.registerHighlightContextMenuItem called', label, action, opts)
  },

  // 检查是否在编辑
  checkEditing: () => {
    console.log('Editor.checkEditing called')
    return Promise.resolve(false)
  },

  // 在编辑位置插入
  insertAtEditingCursor: (content: string) => {
    console.log('Editor.insertAtEditingCursor called', content)
    return Promise.resolve()
  },

  // 恢复编辑光标
  restoreEditingCursor: () => {
    console.log('Editor.restoreEditingCursor called')
    return Promise.resolve()
  },

  // 退出编辑模式
  exitEditingMode: (selectBlock?: boolean) => {
    console.log('Editor.exitEditingMode called', selectBlock)
    return Promise.resolve()
  },

  // 获取编辑光标位置
  getEditingCursorPosition: () => {
    console.log('Editor.getEditingCursorPosition called')
    return Promise.resolve(null)
  },

  // 获取编辑块内容
  getEditingBlockContent: () => {
    console.log('Editor.getEditingBlockContent called')
    return Promise.resolve('')
  },

  // 获取当前页面
  getCurrentPage: () => {
    console.log('Editor.getCurrentPage called')
    return Promise.resolve(null)
  },

  // 获取今日页面
  getTodayPage: () => {
    console.log('Editor.getTodayPage called')
    return Promise.resolve(null)
  },

  // 获取当前块
  getCurrentBlock: () => {
    console.log('Editor.getCurrentBlock called')
    const selection = getSelection()
    const doc = getDocument()

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      let currentElement: Node | null = range.commonAncestorContainer

      while (currentElement && currentElement.nodeType === Node.TEXT_NODE) {
        currentElement = currentElement.parentElement
      }

      if (currentElement && currentElement instanceof HTMLElement) {
        const blockId = generateBlockId(currentElement)
        const content = currentElement.textContent || ''
        return Promise.resolve({
          uuid: blockId,
          content: content,
          properties: {}
        })
      }
    }
    return Promise.resolve({
      uuid: 'default-block',
      content: 'Default block content',
      properties: {}
    })
  },

  // 获取选中块
  getSelectedBlocks: () => {
    console.log('Editor.getSelectedBlocks called')
    return Promise.resolve(null)
  },

  // 清除选中块
  clearSelectedBlocks: () => {
    console.log('Editor.clearSelectedBlocks called')
    return Promise.resolve()
  },

  // 获取当前页面块树
  getCurrentPageBlocksTree: () => {
    console.log('Editor.getCurrentPageBlocksTree called')
    return Promise.resolve([])
  },

  // 获取页面块树
  getPageBlocksTree: (srcPage: any) => {
    console.log('Editor.getPageBlocksTree called', srcPage)
    return Promise.resolve(null)
  },

  // 获取页面链接引用
  getPageLinkedReferences: (srcPage: any) => {
    console.log('Editor.getPageLinkedReferences called', srcPage)
    return Promise.resolve(null)
  },

  // 从命名空间获取页面
  getPagesFromNamespace: (namespace: string) => {
    console.log('Editor.getPagesFromNamespace called', namespace)
    return Promise.resolve(null)
  },

  // 从命名空间获取页面树
  getPagesTreeFromNamespace: (namespace: string) => {
    console.log('Editor.getPagesTreeFromNamespace called', namespace)
    return Promise.resolve(null)
  },

  // 生成新块 UUID
  newBlockUUID: () => {
    console.log('Editor.newBlockUUID called')
    return Promise.resolve('uuid-' + Date.now())
  },

  // 检查是否是页面块
  isPageBlock: (block: any) => {
    console.log('Editor.isPageBlock called', block)
    return false
  },

  // 插入块
  insertBlock: (srcBlock: any, content: string, opts?: any) => {
    console.log('Editor.insertBlock called', srcBlock, content, opts)
    return Promise.resolve(null)
  },

  // 批量插入块
  insertBatchBlock: (srcBlock: any, batch: any, opts?: any) => {
    console.log('Editor.insertBatchBlock called', srcBlock, batch, opts)
    return Promise.resolve(null)
  },

  // 更新块
  updateBlock: (srcBlock: any, content: string, opts?: any) => {
    console.log('Editor.updateBlock called', srcBlock, content, opts)
    const doc = getDocument()
    const element = findElementByBlockId(srcBlock, doc)
    if (element) {
      element.textContent = content
    }
    return Promise.resolve()
  },

  // 删除块
  removeBlock: (srcBlock: any) => {
    console.log('Editor.removeBlock called', srcBlock)
    return Promise.resolve()
  },

  // 获取块
  getBlock: (srcBlock: any, opts?: any) => {
    console.log('Editor.getBlock called', srcBlock, opts)
    return Promise.resolve(null)
  },

  // 设置块折叠状态
  setBlockCollapsed: (srcBlock: any, opts: any) => {
    console.log('Editor.setBlockCollapsed called', srcBlock, opts)
    return Promise.resolve()
  },

  // 获取页面
  getPage: (srcPage: any, opts?: any) => {
    console.log('Editor.getPage called', srcPage, opts)
    return Promise.resolve(null)
  },

  // 创建页面
  createPage: (pageName: string, properties?: any, opts?: any) => {
    console.log('Editor.createPage called', pageName, properties, opts)
    return Promise.resolve(null)
  },

  // 创建日记页面
  createJournalPage: (date: string | Date) => {
    console.log('Editor.createJournalPage called', date)
    return Promise.resolve(null)
  },

  // 删除页面
  deletePage: (pageName: string) => {
    console.log('Editor.deletePage called', pageName)
    return Promise.resolve()
  },

  // 重命名页面
  renamePage: (oldName: string, newName: string) => {
    console.log('Editor.renamePage called', oldName, newName)
    return Promise.resolve()
  },

  // 获取所有页面
  getAllPages: (repo?: string) => {
    console.log('Editor.getAllPages called', repo)
    return Promise.resolve(null)
  },

  // 获取所有标签
  getAllTags: () => {
    console.log('Editor.getAllTags called')
    return Promise.resolve(null)
  },

  // 获取所有属性
  getAllProperties: () => {
    console.log('Editor.getAllProperties called')
    return Promise.resolve(null)
  },

  // 获取标签对象
  getTagObjects: (nameOrIdent: string) => {
    console.log('Editor.getTagObjects called', nameOrIdent)
    return Promise.resolve(null)
  },

  // 创建标签
  createTag: (tagName: string, opts?: any) => {
    console.log('Editor.createTag called', tagName, opts)
    return Promise.resolve(null)
  },

  // 获取标签
  getTag: (nameOrIdent: string | any) => {
    console.log('Editor.getTag called', nameOrIdent)
    return Promise.resolve(null)
  },

  // 按名称获取标签
  getTagsByName: (tagName: string) => {
    console.log('Editor.getTagsByName called', tagName)
    return Promise.resolve(null)
  },

  // 添加标签属性
  addTagProperty: (tagId: any, propertyIdOrName: any) => {
    console.log('Editor.addTagProperty called', tagId, propertyIdOrName)
    return Promise.resolve()
  },

  // 移除标签属性
  removeTagProperty: (tagId: any, propertyIdOrName: any) => {
    console.log('Editor.removeTagProperty called', tagId, propertyIdOrName)
    return Promise.resolve()
  },

  // 添加标签继承
  addTagExtends: (tagId: any, parentTagIdOrName: any) => {
    console.log('Editor.addTagExtends called', tagId, parentTagIdOrName)
    return Promise.resolve()
  },

  // 移除标签继承
  removeTagExtends: (tagId: any, parentTagIdOrName: any) => {
    console.log('Editor.removeTagExtends called', tagId, parentTagIdOrName)
    return Promise.resolve()
  },

  // 添加块标签
  addBlockTag: (blockId: any, tagId: any) => {
    console.log('Editor.addBlockTag called', blockId, tagId)
    return Promise.resolve()
  },

  // 移除块标签
  removeBlockTag: (blockId: any, tagId: any) => {
    console.log('Editor.removeBlockTag called', blockId, tagId)
    return Promise.resolve()
  },

  // 设置块图标
  setBlockIcon: (blockId: any, iconType: string, iconName: string) => {
    console.log('Editor.setBlockIcon called', blockId, iconType, iconName)
    return Promise.resolve()
  },

  // 移除块图标
  removeBlockIcon: (blockId: any) => {
    console.log('Editor.removeBlockIcon called', blockId)
    return Promise.resolve()
  },

  // 添加属性值选项
  addPropertyValueChoices: (propertyId: any, choices: any[]) => {
    console.log('Editor.addPropertyValueChoices called', propertyId, choices)
    return Promise.resolve()
  },

  // 设置属性节点标签
  setPropertyNodeTags: (propertyId: any, tagIds: any[]) => {
    console.log('Editor.setPropertyNodeTags called', propertyId, tagIds)
    return Promise.resolve()
  },

  // 在页面前置块
  prependBlockInPage: (page: any, content: string, opts?: any) => {
    console.log('Editor.prependBlockInPage called', page, content, opts)
    return Promise.resolve(null)
  },

  // 在页面追加块
  appendBlockInPage: (page: any, content: string, opts?: any) => {
    console.log('Editor.appendBlockInPage called', page, content, opts)
    return Promise.resolve(null)
  },

  // 获取前一个兄弟块
  getPreviousSiblingBlock: (srcBlock: any) => {
    console.log('Editor.getPreviousSiblingBlock called', srcBlock)
    return Promise.resolve(null)
  },

  // 获取后一个兄弟块
  getNextSiblingBlock: (srcBlock: any) => {
    console.log('Editor.getNextSiblingBlock called', srcBlock)
    return Promise.resolve(null)
  },

  // 移动块
  moveBlock: (srcBlock: any, targetBlock: any, opts?: any) => {
    console.log('Editor.moveBlock called', srcBlock, targetBlock, opts)
    return Promise.resolve()
  },

  // 编辑块
  editBlock: (srcBlock: any, opts?: any) => {
    console.log('Editor.editBlock called', srcBlock, opts)
    return Promise.resolve()
  },

  // 选中块
  selectBlock: (srcBlock: any) => {
    console.log('Editor.selectBlock called', srcBlock)
    return Promise.resolve()
  },

  // 保存聚焦代码编辑器内容
  saveFocusedCodeEditorContent: () => {
    console.log('Editor.saveFocusedCodeEditorContent called')
    return Promise.resolve()
  },

  // 获取属性
  getProperty: (key: string) => {
    console.log('Editor.getProperty called', key)
    return Promise.resolve(null)
  },

  // 更新属性
  upsertProperty: (key: string, schema?: any, opts?: any) => {
    console.log('Editor.upsertProperty called', key, schema, opts)
    return Promise.resolve({} as any)
  },

  // 删除属性
  removeProperty: (key: string) => {
    console.log('Editor.removeProperty called', key)
    return Promise.resolve()
  },

  // 更新块属性
  upsertBlockProperty: (block: any, key: string, value: any, opts?: any) => {
    console.log('Editor.upsertBlockProperty called', block, key, value, opts)
    return Promise.resolve()
  },

  // 删除块属性
  removeBlockProperty: (block: any, key: string) => {
    console.log('Editor.removeBlockProperty called', block, key)
    return Promise.resolve()
  },

  // 获取块属性
  getBlockProperty: (block: any, key: string) => {
    console.log('Editor.getBlockProperty called', block, key)
    return Promise.resolve(null)
  },

  // 获取块所有属性
  getBlockProperties: (block: any) => {
    console.log('Editor.getBlockProperties called', block)
    return Promise.resolve(null)
  },

  // 获取页面属性
  getPageProperties: (page: any) => {
    console.log('Editor.getPageProperties called', page)
    return Promise.resolve(null)
  },

  // 滚动到页面中的块
  scrollToBlockInPage: (pageName: string, blockId: any, opts?: any) => {
    console.log('Editor.scrollToBlockInPage called', pageName, blockId, opts)
  },

  // 在右侧边栏打开
  openInRightSidebar: (id: any) => {
    console.log('Editor.openInRightSidebar called', id)
  },

  // 打开 PDF 查看器
  openPDFViewer: (assetBlockIdOrFileUrl: string | any) => {
    console.log('Editor.openPDFViewer called', assetBlockIdOrFileUrl)
    return Promise.resolve()
  },

  // 输入选择结束事件
  onInputSelectionEnd: (callback: (...args: any[]) => void) => {
    console.log('Editor.onInputSelectionEnd called')
    return () => {}
  }
}

// 生成基于元素路径的唯一 ID
function generateBlockId(element: HTMLElement): string {
  const path: string[] = []
  let current: Element | null = element

  while (current) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      selector = `#${current.id}`
    } else if (current.classList.length > 0) {
      const classes = Array.from(current.classList).join('.')
      selector += `.${classes}`
    } else {
      const siblings = current.parentElement?.children
      let index = 0
      if (siblings) {
        for (let i = 0; i < siblings.length; i++) {
          if (siblings[i] === current) {
            index = i
            break
          }
        }
        selector += `:nth-child(${index + 1})`
      }
    }

    path.unshift(selector)
    current = current.parentElement
  }

  return path.join(' > ')
}

// 根据 blockId 查找元素
function findElementByBlockId(blockId: string, doc: Document): HTMLElement | null {
  if (blockId === 'default-block') {
    return doc.getElementById('main-content-container')
  }

  try {
    const elements = doc.querySelectorAll(blockId)
    if (elements.length > 0) {
      return elements[0] as HTMLElement
    }
  } catch (error) {
    console.error('Error finding element by blockId:', error)
  }

  const allElements = doc.querySelectorAll('*')
  for (const element of allElements) {
    if (element.textContent?.includes(blockId)) {
      return element as HTMLElement
    }
  }

  return null
}

export default Editor
