import { t } from "logseq-l10n"
import { handleAnnotation, handleComment } from "./annotation.js"

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

function repl(before, selection, after, start, end, regex, replacement) {
  const newText = selection.replace(new RegExp(regex, "g"), replacement)
  return [`${before}${newText}${after}`, start, start + newText.length]
}
