export function createCommentAnnotationModal(selection, onSubmit, onCancel) {
  const existingModal = parent.document.getElementById("kef-wrap-comment-modal")
  if (existingModal) {
    existingModal.remove()
  }

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

  parent.document.body.appendChild(modal)

  parent.document.getElementById("kef-wrap-modal-close").addEventListener("click", onCancel)
  parent.document.getElementById("kef-wrap-modal-cancel").addEventListener("click", onCancel)
  parent.document.getElementById("kef-wrap-modal-submit").addEventListener("click", () => {
    const content = parent.document.getElementById("kef-wrap-modal-content").value
    onSubmit(content)
  })

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      onCancel()
    }
  })

  parent.document.addEventListener("keydown", function handleEscKey(e) {
    if (e.key === "Escape") {
      onCancel()
      parent.document.removeEventListener("keydown", handleEscKey)
    }
  })

  setTimeout(() => {
    parent.document.getElementById("kef-wrap-modal-content").focus()
  }, 100)

  return function closeModal() {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal)
    }
  }
}

export async function handleAnnotation(isTestMode) {
  const currentPage = await logseq.Editor.getCurrentPage()
  if (!currentPage) return

  const currentBlock = await logseq.Editor.getCurrentBlock()
  if (!currentBlock) return

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
    alert('标注功能已触发\n\n测试模式下的操作：\n1. 模拟在当前页面尾部添加 ## annotation 标题\n2. 将选中的文本作为子节点添加\n3. 在子节点下创建空白节点并定位光标')
    return
  }

  const closeModal = createCommentAnnotationModal(selection, async (content) => {
    closeModal()

    let annotationBlock = null
    const blocks = await logseq.Editor.getPageBlocksTree(currentPage.name)
    
    for (const block of blocks) {
      if (block.content.trim() === "## annotation") {
        annotationBlock = block
        break
      }
    }

    if (!annotationBlock) {
      annotationBlock = await logseq.Editor.insertBlock(
        currentPage.uuid,
        "## annotation",
        { before: false }
      )
    }

    const childBlock = await logseq.Editor.insertBlock(
      annotationBlock.uuid,
      selection.trim(),
      { before: false }
    )

    const commentBlock = await logseq.Editor.insertBlock(
      childBlock.uuid,
      content.trim() || "",
      { before: false }
    )

    await logseq.Editor.editBlock(commentBlock.uuid)
  }, () => {
    closeModal()
  })
}

export async function handleComment(type, isTestMode) {
  const currentBlock = await logseq.Editor.getCurrentBlock()
  if (!currentBlock) return

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
    const commentType = type === 'page' ? '页面' : '日记'
    alert(`${commentType}评论功能已触发\n\n测试模式下的操作：\n1. 在${commentType}页面创建 ## comment 标题\n2. 创建子节点，内容为选中节点的引用\n3. 在子节点下创建空白节点并定位光标`)
    return
  }

  const closeModal = createCommentAnnotationModal(selection, async (content) => {
    closeModal()

    let targetPage
    if (type === "page") {
      targetPage = await logseq.Editor.getCurrentPage()
    } else if (type === "journal") {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const day = String(today.getDate()).padStart(2, "0")
      const journalName = `${year}-${month}-${day}`
      targetPage = await logseq.Editor.createPage(journalName, {}, { journal: true })
    }

    if (!targetPage) return

    let commentBlock = null
    const blocks = await logseq.Editor.getPageBlocksTree(targetPage.name)
    
    for (const block of blocks) {
      if (block.content.trim() === "## comment") {
        commentBlock = block
        break
      }
    }

    if (!commentBlock) {
      commentBlock = await logseq.Editor.insertBlock(
        targetPage.uuid,
        "## comment",
        { before: false }
      )
    }

    const blockRef = `(((${currentBlock.uuid}))`
    
    const refBlock = await logseq.Editor.insertBlock(
      commentBlock.uuid,
      blockRef,
      { before: false }
    )

    const newCommentBlock = await logseq.Editor.insertBlock(
      refBlock.uuid,
      content.trim() || "",
      { before: false }
    )

    await logseq.Editor.editBlock(newCommentBlock.uuid)
  }, () => {
    closeModal()
  })
}
