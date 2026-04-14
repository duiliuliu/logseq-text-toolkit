import { t } from "logseq-l10n"
import { isTestMode, getTextarea } from "./toolbar"

// 注册命令
export function registerCommand(model, { key, label, binding }) {
  if (binding) {
    logseq.App.registerCommandPalette(
      { key, label, keybinding: { binding } },
      model[key],
    )
  } else {
    logseq.App.registerCommandPalette({ key, label }, model[key])
  }
}

// 注册模型
export function registerModel(
  model,
  { key, template, pluginCommand, regex, replacement },
) {
  if (key.startsWith("wrap-")) {
    model[key] = () => updateBlockText(wrap, template, pluginCommand)
  } else if (key.startsWith("repl-")) {
    model[key] = () => updateBlockText(repl, regex, replacement)
  } else if (key.startsWith("anno-")) {
    model[key] = () => handleAnnotation()
  } else if (key.startsWith("comment-")) {
    if (key === "comment-page") {
      model[key] = () => handleComment("page")
    } else if (key === "comment-journal") {
      model[key] = () => handleComment("journal")
    }
  }
}

// 更新块文本
async function updateBlockText(producer, ...args) {
  const block = await logseq.Editor.getCurrentBlock()

  const textarea = getTextarea()
  if (block == null || textarea == null) {
    logseq.App.showMsg(
      t("This command can only be used when editing text"),
      "error",
    )
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = textarea.value.substring(0, start)
  const selection = textarea.value.substring(start, end)
  const after = textarea.value.substring(end)
  const [text, selStart, selEnd] = await producer(
    before,
    selection,
    after,
    start,
    end,
    ...args,
  )
  
  if (isTestMode) {
    // 在测试模式下直接更新textarea
    textarea.value = text
    textarea.focus()
    textarea.setSelectionRange(selStart, selEnd)
  } else {
    // 在Logseq环境下使用Logseq API
    await logseq.Editor.updateBlock(block.uuid, text)
    if (textarea?.isConnected) {
      textarea.focus()
      textarea.setSelectionRange(selStart, selEnd)
    } else {
      await logseq.Editor.editBlock(block.uuid)
      parent.document.activeElement.setSelectionRange(selStart, selEnd)
    }
  }
}

// 包装文本
async function wrap(
  before,
  selection,
  after,
  start,
  end,
  template,
  pluginCommand,
) {
  const m = selection.match(/\s+$/)
  const [text, whitespaces] = 
    m == null ? [selection, ""] : [selection.substring(0, m.index), m[0]]

  if (template.includes("$%") && pluginCommand) {
    const pluginId = pluginCommand.split(".")[0]
    const pluginInfo = await logseq.App.getExternalPlugin(pluginId)
    if (pluginInfo != null && !pluginInfo.settings?.disabled) {
      const commandRet = await logseq.App.invokeExternalPlugin(pluginCommand)
      template = template.replace("$%", commandRet == null ? "" : commandRet)
    } else {
      logseq.UI.showMsg(
        t('You must have the plugin "${pluginId}" installed and enabled.', {
          pluginId,
        }),
        "warning",
        { timeout: 10000 },
      )
      return [`${before}${selection}${after}`, start, end]
    }
  }

  const [wrapBefore, wrapAfter] = template.split("$^")
  const resultText = `${before}${wrapBefore}${text}${wrapAfter ?? ""}${whitespaces}${after}`
  const newStart = start
  const newEnd = end + wrapBefore.length - whitespaces.length + (wrapAfter?.length || 0)
  return [resultText, newStart, newEnd]
}

// 替换文本
function repl(before, selection, after, start, end, regex, replacement) {
  const newText = selection.replace(new RegExp(regex, "g"), replacement)
  return [`${before}${newText}${after}`, start, start + newText.length]
}

// 处理标注
async function handleAnnotation() {
  // 获取当前页面
  const currentPage = await logseq.Editor.getCurrentPage()
  if (!currentPage) return

  // 获取当前编辑的块
  const currentBlock = await logseq.Editor.getCurrentBlock()
  if (!currentBlock) return

  // 获取选中的文本
  const activeElement = parent.document.activeElement
  if (activeElement.nodeName.toLowerCase() !== "textarea") {
    logseq.App.showMsg("请先选择要添加标注的文本", "error")
    return
  }
  
  const textarea = activeElement
  const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
  if (!selection.trim()) {
    logseq.App.showMsg("请选择要添加标注的文本", "error")
    return
  }

  if (isTestMode) {
    // 在测试模式下的处理
    alert('标注功能已触发\n\n测试模式下的操作：\n1. 模拟在当前页面尾部添加 ## annotation 标题\n2. 将选中的文本作为子节点添加\n3. 在子节点下创建空白节点并定位光标')
    return
  }

  // 创建弹窗
  const closeModal = createCommentAnnotationModal(selection, async (content) => {
    // 关闭弹窗
    closeModal()

    // 查找或创建 "## annotation" 块
    let annotationBlock = null
    const blocks = await logseq.Editor.getPageBlocksTree(currentPage.name)
    
    for (const block of blocks) {
      if (block.content.trim() === "## annotation") {
        annotationBlock = block
        break
      }
    }

    if (!annotationBlock) {
      // 创建 "## annotation" 块
      annotationBlock = await logseq.Editor.insertBlock(
        currentPage.uuid,
        "## annotation",
        { before: false }
      )
    }

    // 在 annotation 块下创建子块，内容为选中的文本
    const childBlock = await logseq.Editor.insertBlock(
      annotationBlock.uuid,
      selection.trim(),
      { before: false }
    )

    // 在子块下创建块，内容为用户输入的注解
    const commentBlock = await logseq.Editor.insertBlock(
      childBlock.uuid,
      content.trim() || "",
      { before: false }
    )

    // 编辑新创建的块
    await logseq.Editor.editBlock(commentBlock.uuid)
  }, () => {
    // 关闭弹窗
    closeModal()
  })
}

// 处理评论
async function handleComment(type) {
  // 获取当前编辑的块
  const currentBlock = await logseq.Editor.getCurrentBlock()
  if (!currentBlock) return

  // 获取选中的文本
  const activeElement = parent.document.activeElement
  if (activeElement.nodeName.toLowerCase() !== "textarea") {
    logseq.App.showMsg("请先选择要添加评论的文本", "error")
    return
  }
  
  const textarea = activeElement
  const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
  if (!selection.trim()) {
    logseq.App.showMsg("请选择要添加评论的文本", "error")
    return
  }

  if (isTestMode) {
    // 在测试模式下的处理
    const commentType = type === 'page' ? '页面' : '日记'
    alert(`${commentType}评论功能已触发\n\n测试模式下的操作：\n1. 在${commentType}页面创建 ## comment 标题\n2. 创建子节点，内容为选中节点的引用\n3. 在子节点下创建空白节点并定位光标`)
    return
  }

  // 创建弹窗
  const closeModal = createCommentAnnotationModal(selection, async (content) => {
    // 关闭弹窗
    closeModal()

    // 确定目标页面
    let targetPage
    if (type === "page") {
      // 使用当前页面
      targetPage = await logseq.Editor.getCurrentPage()
    } else if (type === "journal") {
      // 使用当前日期的 journal 页面
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const day = String(today.getDate()).padStart(2, "0")
      const journalName = `${year}-${month}-${day}`
      targetPage = await logseq.Editor.createPage(journalName, {}, { journal: true })
    }

    if (!targetPage) return

    // 查找或创建 "## comment" 块
    let commentBlock = null
    const blocks = await logseq.Editor.getPageBlocksTree(targetPage.name)
    
    for (const block of blocks) {
      if (block.content.trim() === "## comment") {
        commentBlock = block
        break
      }
    }

    if (!commentBlock) {
      // 创建 "## comment" 块
      commentBlock = await logseq.Editor.insertBlock(
        targetPage.uuid,
        "## comment",
        { before: false }
      )
    }

    // 获取当前块的引用
    const blockRef = `(((${currentBlock.uuid}))`
    
    // 在 comment 块下创建子块，内容为块引用
    const refBlock = await logseq.Editor.insertBlock(
      commentBlock.uuid,
      blockRef,
      { before: false }
    )

    // 在子块下创建块，内容为用户输入的评论
    const newCommentBlock = await logseq.Editor.insertBlock(
      refBlock.uuid,
      content.trim() || "",
      { before: false }
    )

    // 编辑新创建的块
    await logseq.Editor.editBlock(newCommentBlock.uuid)
  }, () => {
    // 关闭弹窗
    closeModal()
  })
}

// 创建评论和注解的弹窗
function createCommentAnnotationModal(selection, onSubmit, onCancel) {
  // 检查是否已存在弹窗，如果存在则移除
  const existingModal = parent.document.getElementById("kef-wrap-comment-modal")
  if (existingModal) {
    existingModal.remove()
  }

  // 创建弹窗容器
  const modal = parent.document.createElement("div")
  modal.id = "kef-wrap-comment-modal"
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--ls-primary-background-color, #fff);
    border: 1px solid var(--ls-border-color, #ddd);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 20px;
    z-index: var(--ls-z-index-level-3, 1000);
    width: 400px;
    max-width: 90vw;
  `

  // 创建弹窗内容
  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <div style="font-weight: bold; color: var(--ls-primary-text-color, #333);">${selection.substring(0, 50)}${selection.length > 50 ? '...' : ''}</div>
      <button id="kef-wrap-modal-close" style="background: none; border: none; font-size: 16px; cursor: pointer; color: var(--ls-secondary-text-color, #666);">&times;</button>
    </div>
    <div style="margin-bottom: 15px;">
      <textarea id="kef-wrap-modal-content" rows="4" style="width: 100%; padding: 10px; border: 1px solid var(--ls-border-color, #ddd); border-radius: 4px; resize: vertical; font-family: var(--ls-font-family, sans-serif); font-size: 14px;"></textarea>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button id="kef-wrap-modal-cancel" style="padding: 6px 12px; border: 1px solid var(--ls-border-color, #ddd); border-radius: 4px; background: var(--ls-secondary-background-color, #f5f5f5); cursor: pointer; font-size: 14px;">取消</button>
      <button id="kef-wrap-modal-submit" style="padding: 6px 12px; border: 1px solid var(--ls-primary-color, #007bff); border-radius: 4px; background: var(--ls-primary-color, #007bff); color: white; cursor: pointer; font-size: 14px;">确定</button>
    </div>
  `

  // 添加到文档
  parent.document.body.appendChild(modal)

  // 添加事件监听器
  parent.document.getElementById("kef-wrap-modal-close").addEventListener("click", onCancel)
  parent.document.getElementById("kef-wrap-modal-cancel").addEventListener("click", onCancel)
  parent.document.getElementById("kef-wrap-modal-submit").addEventListener("click", () => {
    const content = parent.document.getElementById("kef-wrap-modal-content").value
    onSubmit(content)
  })

  // 点击外部关闭弹窗
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      onCancel()
    }
  })

  // 按ESC键关闭弹窗
  parent.document.addEventListener("keydown", function handleEscKey(e) {
    if (e.key === "Escape") {
      onCancel()
      parent.document.removeEventListener("keydown", handleEscKey)
    }
  })

  // 聚焦到文本域
  setTimeout(() => {
    parent.document.getElementById("kef-wrap-modal-content").focus()
  }, 100)

  // 关闭弹窗的函数
  return function closeModal() {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal)
    }
  }
}
