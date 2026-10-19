# SelectToolbar 选区集成说明

## 背景

Logseq DB 版本（2.x）的块编辑器不是 `contenteditable` 文本树，而是：

```html
<div class="editor-inner">
  <textarea id="edit-block-xxx" class="block-editor">...</textarea>
  <div class="mock-text"></div>
</div>
```

因此 `window.getSelection()` 虽然还可能返回文字，但 `getRangeAt(0)` 是空 Range（`startContainer` 是 `.editor-inner`，`rect` 为 0×0），不能用于计算字符偏移和工具栏位置。

## 主链路：Editor.onInputSelectionEnd

Logseq Host 在 textarea 的 `select` 事件里会通过 `onInputSelectionEnd` 下发：

```ts
{
  text: string;
  start: number;
  end: number;
  caret?: { left, top, height, pos, rect };
  point?: { x, y };
}
```

生产代码位置：

- `src/components/SelectToolbar/index.tsx`
  - 订阅 `logseqAPI.Editor.onInputSelectionEnd`
  - 调用 `createSelectionFromSDKEvent(event, block)` 生成统一的 `SelectedData`
  - 用 `point`（mouseup 坐标）或 `caret` 计算工具栏位置
- `src/lib/toolbar/selection.ts`
  - `createSelectionFromSDKEvent`：把 SDK 事件转换成 `SelectedData`，并计算 `before/after`
  - `resolveSelectionRange`：优先信任 `start/end`，内容未同步时回退到 `text.indexOf`
  - `replaceSelectionInContent`：按字符偏移精确替换
  - `calculateToolbarPositionFromPoint`：视口内定位

## 回退链路：原生 DOM Selection

当 Host 没有 `onInputSelectionEnd`（旧版本或 file 图）时，`SelectToolbar` 回退到：

- 监听 `targetElement`（或 document）的 `mouseup`
- 读取 `window.getSelection()`
- 通过 `resolveSelectionRange(content, { text })` 解析偏移
- 位置优先使用 `getEditingCursorPosition()`，失败时使用 Range rect / `.ls-block` rect

注意：`getEditingCursorPosition()` 可能返回 `null`，不能再作为显示工具栏的唯一条件。

## 初始化兜底

`src/initializer.ts` 的 `resolveToolbarTarget` 会依次尝试：

1. `#main-content-container`
2. `#app-main-home`

工具栏只强依赖插件自己的 `#text-toolkit-toolbar` 容器；主内容容器晚挂载时通过短轮询重试，不会永久放弃渲染。

## 替换逻辑

`src/lib/textReplace/utils.ts` 的 `updateBlockContent` 顺序：

1. 按 `start/end` + block.content 精确替换（DB 图主路径）
2. 偏移不可用时尝试 DOM 文本节点替换（file 图兼容）
3. 最后回退到 `indexOf` 第一处匹配（旧逻辑）

## 测试

- `src/lib/toolbar/selection.test.ts`：SDK 事件适配、重复文本偏移、替换和定位
- `src/lib/textReplace/updateBlockContent.test.ts`：偏移替换、重复文本、内容未同步、异常
- `src/components/SelectToolbar/SelectToolbar.sdk.test.tsx`：SDK 回调、显示/隐藏、点击、取消订阅
- `src/components/SelectToolbar/SelectToolbar.native.test.tsx`：旧 Host 原生回退
- `src/components/SelectToolbar/SelectToolbar.integration.test.tsx`：真实 Mock Host 的 textarea 选区 → 工具栏 → 格式化 → updateBlock 全链路
- `src/initializer.test.ts`：主内容容器兜底

## 旧组件

`SelectionManager.ts` / `SelectToolbarWithSDK.tsx` 保留为历史兼容与示例；生产入口使用 `SelectToolbar` + `selection.ts`。
