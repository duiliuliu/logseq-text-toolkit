import { t } from "logseq-l10n"
import { handleAnnotation, handleComment } from "./annotation.js"

/**
 * 注册命令到Logseq命令面板
 * @param {Object} model - 命令模型对象
 * @param {Object} options - 命令选项
 * @param {string} options.key - 命令键名
 * @param {string} options.label - 命令标签
 * @param {string} options.binding - 快捷键绑定
 */
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

/**
 * 注册模型命令
 * @param {Object} model - 命令模型对象
 * @param {Object} options - 命令选项
 * @param {string} options.key - 命令键名
 * @param {string} options.template - 包装模板
 * @param {string} options.pluginCommand - 插件命令
 * @param {string} options.regex - 正则表达式
 * @param {string} options.replacement - 替换文本
 * @param {HTMLElement} textarea - 文本区域元素
 */
export function registerModel(
  model,
  { key, template, pluginCommand, regex, replacement },
  textarea,
) {
  if (key.startsWith("wrap-")) {
    model[key] = () => updateBlockText(textarea, wrap, template, pluginCommand)
  } else if (key.startsWith("repl-")) {
    model[key] = () => updateBlockText(textarea, repl, regex, replacement)
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

/**
 * 更新块文本
 * @param {HTMLElement} textarea - 文本区域元素
 * @param {Function} producer - 文本处理函数
 * @param {...any} args - 传递给处理函数的参数
 */
async function updateBlockText(textarea, producer, ...args) {
  const block = await logseq.Editor.getCurrentBlock()

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
  
  await logseq.Editor.updateBlock(block.uuid, text)
  if (textarea?.isConnected) {
    textarea.focus()
    textarea.setSelectionRange(selStart, selEnd)
  } else {
    await logseq.Editor.editBlock(block.uuid)
    parent.document.activeElement.setSelectionRange(selStart, selEnd)
  }
}

/**
 * 包装文本
 * @param {string} before - 选择前的文本
 * @param {string} selection - 选中的文本
 * @param {string} after - 选择后的文本
 * @param {number} start - 选择开始位置
 * @param {number} end - 选择结束位置
 * @param {string} template - 包装模板
 * @param {string} pluginCommand - 插件命令
 * @returns {Array} [处理后的文本, 新的选择开始位置, 新的选择结束位置]
 */
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

/**
 * 替换文本
 * @param {string} before - 选择前的文本
 * @param {string} selection - 选中的文本
 * @param {string} after - 选择后的文本
 * @param {number} start - 选择开始位置
 * @param {number} end - 选择结束位置
 * @param {string} regex - 正则表达式
 * @param {string} replacement - 替换文本
 * @returns {Array} [处理后的文本, 新的选择开始位置, 新的选择结束位置]
 */
function repl(before, selection, after, start, end, regex, replacement) {
  const newText = selection.replace(new RegExp(regex, "g"), replacement)
  return [`${before}${newText}${after}`, start, start + newText.length]
}
