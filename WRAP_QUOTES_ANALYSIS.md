# wrapWithQuotesIfNeeded 场景梳理报告

## 📋 函数概述

`wrapWithQuotesIfNeeded` 是 `utils.ts` 中的核心函数，用于智能处理文本的引号包裹逻辑。

### 函数签名
```typescript
wrapWithQuotesIfNeeded(prefix: string, suffix: string, text: string): string
```

---

## 🎯 包裹引号的核心规则

### 1. **不包裹的场景** ❌

#### 1.1 完整 Hiccup 格式
```typescript
if (text.startsWith('[:') && text.endsWith(']')) {
  return prefix + text + suffix;
}
```
**示例:**
- 输入: `text = "[:b 粗体文本]"`
- 前缀: `[:span.red `
- 后缀: `]`
- 输出: `[:span.red [:b 粗体文本]]` ❌ 不加引号

**原因:** 已经是一个完整的 Hiccup 标签，不需要再包裹

---

#### 1.2 包含 Hiccup 片段
```typescript
if (text.includes('[:')) {
  return prefix + text + suffix;
}
```
**示例:**
- 输入: `text = "普通文本 [:b 粗体"]`
- 前缀: `[:div `
- 后缀: `]`
- 输出: `[:div 普通文本 [:b 粗体"]]` ❌ 不加引号

**原因:** 如果文本中包含 Hiccup 片段，说明已经处理过嵌套格式，再包裹会破坏结构

---

### 2. **需要包裹的场景** ✅

#### 2.1 前缀和后缀都没有引号，但文本需要引号
```typescript
if (needsQuotes(text) && !prefixHasQuote && !suffixHasQuote) {
  return prefix + `"${text}"` + suffix;
}
```

**`needsQuotes` 的判断标准:**
```typescript
export const needsQuotes = (text: string): boolean => {
  // 跳过已经是完整 hiccup 格式的文本
  if (text.startsWith('[:') && text.endsWith(']')) {
    return false;
  }
  
  // 检查是否包含特殊字符
  return text.includes(' ') ||      // 空格
         text.includes('\u00A0') ||  // 不间断空格
         text.includes('\u3000') ||  // 全角空格
         text.includes('"') ||       // 双引号
         text.includes("'");         // 单引号
};
```

**示例:**
- 输入: `text = "带空格的文本"`
- 前缀: `[:span.red `
- 后缀: `]`
- 触发条件: `needsQuotes("带空格的文本")` = true
- 输出: `[:span.red "带空格的文本"]` ✅ 添加引号

---

#### 2.2 场景示例汇总

| 场景 | 输入文本 | 前缀 | 后缀 | 是否包裹 | 输出 |
|------|---------|------|------|---------|------|
| ✅ 空格 | `Hello World` | `[:b ` | `]` | 是 | `[:b "Hello World"]` |
| ✅ 不间断空格 | `Hello\u00A0World` | `[:b ` | `]` | 是 | `[:b "Hello World"]` |
| ✅ 全角空格 | `Hello\u3000World` | `[:b ` | `]` | 是 | `[:b "Hello World"]` |
| ✅ 包含双引号 | `Hello"World` | `[:b ` | `]` | 是 | `[:b "Hello\"World"]` |
| ✅ 包含单引号 | `Hello'World` | `[:b ` | `]` | 是 | `[:b "Hello'World"]` |
| ❌ 无特殊字符 | `HelloWorld` | `[:b ` | `]` | 否 | `[:b HelloWorld]` |
| ❌ 完整Hiccup | `[:b Hello]` | `[:div ` | `]` | 否 | `[:div [:b Hello]]` |
| ❌ Hiccup片段 | `Hello[:b World]` | `[:div ` | `]` | 否 | `[:div Hello[:b World]]` |

---

## 🔄 需要移除引号的场景

#### 3.1 前缀和后缀都有引号，但文本不需要引号
```typescript
if (!needsQuotes(text) && prefixHasQuote && suffixHasQuote) {
  const cleanPrefix = prefix.slice(0, -1);
  const cleanSuffix = suffix.slice(1);
  return cleanPrefix + text + cleanSuffix;
}
```

**示例:**
- 输入: `text = "HelloWorld"` (无空格)
- 前缀: `[:span.red "`
- 后缀: `"`
- 触发条件: `!needsQuotes("HelloWorld")` = true
- 输出: `[:span.red HelloWorld]` ✅ 移除引号

**原因:** 保持一致性，避免不必要的引号

---

## 🤔 哪些场景**不需要** wrap quotes？

基于以上分析，以下场景**不应该**包裹引号：

### ❌ 场景 1: 已经是 Hiccup 格式
```typescript
[:b bold text]  // 不需要引号
[:span.red text]  // 不需要引号
[:div [:b nested]]  // 不需要引号
```

### ❌ 场景 2: 包含 Hiccup 片段
```typescript
普通文本 [:b bold] 继续  // 不需要引号
```

### ❌ 场景 3: 无空格的纯文本
```typescript
HelloWorld  // 不需要引号
中文文本  // 不需要引号
NoSpaces  // 不需要引号
```

### ❌ 场景 4: Markdown 格式转换后
```typescript
**bold text**  // 转换为 [:b bold text] 后不需要引号
*italic text*  // 转换为 [:i italic text] 后不需要引号
```

---

## ✅ 哪些场景**需要** wrap quotes？

### ✅ 场景 1: 带空格的普通文本
```typescript
Hello World  // ✅ 需要引号: "Hello World"
这是 测试 文本  // ✅ 需要引号: "这是 测试 文本"
```

### ✅ 场景 2: 包含特殊空格的文本
```typescript
Hello\u00A0World  // ✅ 需要引号: "Hello World"
中文\u3000文本  // ✅ 需要引号: "中文 文本"
```

### ✅ 场景 3: 包含引号的文本
```typescript
Hello"World  // ✅ 需要引号: "Hello\"World"
say'hello'  // ✅ 需要引号: "say'hello'"
```

---

## 📊 决策流程图

```
开始
  ↓
文本是否为完整Hiccup? → 是 → 直接返回，不包裹
  ↓ 否
文本是否包含Hiccup片段? → 是 → 直接返回，不包裹
  ↓ 否
前缀有引号 AND 后缀有引号? → 是 → 检查文本是否需要引号
  ↓ 否                           ↓
检查文本是否需要引号        需要引号? → 移除前缀引号和后缀引号
  ↓                           ↓
需要引号? → 是 → 添加引号包裹        返回文本
  ↓ 否
保持原样，返回文本
```

---

## 🔍 实际调用场景分析

### 调用点 1: `handleNestedQuotes` 函数

```typescript
// 在 handleNestedQuotes 中调用
if (isEntirelyWrappedFormat) {
  if (prefixHasQuote && suffixHasQuote) {
    return prefix.slice(0, -1) + nestedText + suffix.slice(1);
  } else {
    if (nestedIsHiccup || nestedContainsHiccup) {
      return prefix + nestedText + suffix;  // ❌ 不包裹
    }
    return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);  // ⚠️ 需要判断
  }
}
```

**何时会调用 wrapWithQuotesIfNeeded:**
- `isEntirelyWrappedFormat = true`
- `prefixHasQuote = false` 或 `suffixHasQuote = false`
- `nestedIsHiccup = false` 且 `nestedContainsHiccup = false`

**典型场景:**
- 输入: `**bold**`
- 转换后: `[:b bold]`
- 再次包裹: `[:span.red [:b bold]]`

---

### 调用点 2: `replaceText` 函数（else分支）

```typescript
// 在 replaceText 的 else 分支中调用
if (wrapper && hasExistingFormat(text)) {
  const nestedText = parseNestedFormat(text);
  return handleNestedQuotes(wrapper.prefix, wrapper.suffix, text, nestedText);
} else {
  if (wrapper) {
    return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, text);  // ⚠️ 需要判断
  }
}
```

**何时会调用:**
- `hasExistingFormat(text) = false` (文本没有格式标记)
- `wrapper` 存在

**典型场景:**
- 输入: `Hello World` (无格式)
- 输出: `[:span.blue "Hello World"]` ✅ 添加引号

---

## 💡 优化建议

### 建议 1: 简化逻辑

当前逻辑比较复杂，可以简化为：

```typescript
export const wrapWithQuotesIfNeeded = (
  prefix: string, 
  suffix: string, 
  text: string
): string => {
  // 1. 已经是 Hiccup 或包含 Hiccup → 不包裹
  if (text.startsWith('[:') && text.endsWith(']')) {
    return prefix + text + suffix;
  }
  if (text.includes('[:')) {
    return prefix + text + suffix;
  }
  
  // 2. 前缀有引号，后缀有引号，但文本无空格 → 移除引号
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  if (prefixHasQuote && suffixHasQuote && !needsQuotes(text)) {
    return prefix.slice(0, -1) + text + suffix.slice(1);
  }
  
  // 3. 前缀无引号，后缀无引号，但文本有空格 → 添加引号
  if (!prefixHasQuote && !suffixHasQuote && needsQuotes(text)) {
    return prefix + `"${text}"` + suffix;
  }
  
  // 4. 其他情况保持原样
  return prefix + text + suffix;
};
```

### 建议 2: 添加文档注释

```typescript
/**
 * 智能处理文本引号包裹
 * 
 * 规则:
 * 1. 完整 Hiccup 格式不包裹
 * 2. 包含 Hiccup 片段不包裹
 * 3. 带空格的普通文本需要包裹
 * 4. 前缀后缀引号不一致时自动调整
 * 
 * @param prefix - 前缀部分（如 "[:span.red "）
 * @param suffix - 后缀部分（如 "]"）
 * @param text - 要包裹的文本
 * @returns 处理后的文本
 */
```

---

## 📝 总结

### 需要 wrap quotes 的场景 ✅
1. **带空格的文本** - `Hello World` → `"Hello World"`
2. **包含特殊空格** - `Hello\u00A0World` → `"Hello World"`
3. **包含引号** - `Hello"World` → `"Hello\"World"`

### 不需要 wrap quotes 的场景 ❌
1. **完整 Hiccup** - `[:b text]` → `[:div [:b text]]`
2. **Hiccup 片段** - `text [:b bold]` → `[:div text [:b bold]]`
3. **无空格纯文本** - `HelloWorld` → `[:b HelloWorld]`
4. **已转换的 Markdown** - `[:b bold]` → `[:span.red [:b bold]]`

### 关键洞察
- **引号主要用于分隔属性和内容**，避免歧义
- **Hiccup 格式内部不需要引号**，因为标签结构已经提供了分隔
- **中文文本通常不需要引号**，除非包含空格或特殊字符

