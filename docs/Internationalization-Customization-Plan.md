# 国际化配置自定义方案设计

## 1. 配置结构设计

### 1.1 设置结构扩展
在设置中添加 `meta.language` 部分，用于管理语言配置：

```typescript
// src/settings/types.ts
export interface LanguageConfig {
  code: string;       // 语言代码，如 zh-CN, en, ja
  name: string;       // 语言名称，如 "中文", "English", "日本語"
  path: string;       // 语言文件路径，相对于插件根目录
  isDefault?: boolean; // 是否为默认语言
}

export interface LanguageMeta {
  languages: LanguageConfig[];  // 语言列表
  fallbackLanguage: string;     // 降级语言代码
}

export interface Settings {
  // 现有字段...
  meta?: {
    language?: LanguageMeta;
  };
}
```

### 1.2 默认配置
在 `defaultSettings.json` 中添加默认的语言配置：

```json
{
  "disabled": false,
  "theme": "light",
  "language": "zh-CN",
  "meta": {
    "language": {
      "languages": [
        {
          "code": "zh-CN",
          "name": "中文",
          "path": "translations/zh-CN.json",
          "isDefault": true
        },
        {
          "code": "en",
          "name": "English",
          "path": "translations/en.json"
        },
        {
          "code": "ja",
          "name": "日本語",
          "path": "translations/ja.json"
        }
      ],
      "fallbackLanguage": "zh-CN"
    }
  },
  // 其他现有配置...
}
```

## 2. 构建配置修改

### 2.1 复制语言文件脚本
在 `package.json` 中添加复制语言文件的脚本：

```json
"scripts": {
  "dev": "vite",
  "test": "vite --mode test",
  "build": "vite build --mode test && npm run copy-assets",
  "build:plugin": "vite build && npm run copy-assets",
  "preview": "vite preview",
  "copy-assets": "mkdir -p dist/translations && cp -f src/translations/*.json dist/translations/ && npm run copy-css"
}
```

### 2.2 Vite 配置
确保 Vite 配置正确处理静态资源：

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    // 现有配置...
    build: {
      // 现有配置...
      rollupOptions: {
        output: {
          // 现有配置...
        },
      },
    },
    // 确保静态资源正确处理
    publicDir: 'public',
  }
})
```

## 3. 国际化加载逻辑

### 3.1 动态语言加载
修改 `i18n.ts`，实现动态加载语言文件：

```typescript
// src/translations/i18n.ts
import { TranslationKeys, SupportedLanguage, Translations } from './translations.ts'
import { getSettings } from '../settings/index.ts'

// 内置语言作为 fallback
import en from './en.json'
import ja from './ja.json'
import zhCN from './zh-CN.json'

const builtInTranslations: Translations = {
  'en': en as TranslationKeys,
  'ja': ja as TranslationKeys,
  'zh-CN': zhCN as TranslationKeys
}

// 动态加载的翻译
let dynamicTranslations: Translations = {}

// 递归获取翻译值
const getNestedValue = (obj: any, key: string): string => {
  if (!obj || !key) return key
  const keys = key.split('.')
  let result = obj

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      return key
    }
  }

  return result as string
}

// 加载语言文件
const loadLanguageFile = async (langCode: string, filePath: string): Promise<TranslationKeys | null> => {
  try {
    // 尝试从 dist 目录加载
    const response = await fetch(`./${filePath}`)
    if (response.ok) {
      const translation = await response.json()
      return translation as TranslationKeys
    }
    // 加载失败，返回 null
    return null
  } catch (error) {
    console.warn(`Failed to load language file for ${langCode}:`, error)
    return null
  }
}

// 初始化语言
export const initI18n = async (): Promise<void> => {
  const settings = getSettings()
  const languageMeta = settings.meta?.language
  
  if (languageMeta?.languages) {
    for (const lang of languageMeta.languages) {
      const translation = await loadLanguageFile(lang.code, lang.path)
      if (translation) {
        dynamicTranslations[lang.code] = translation
      }
    }
  }
}

// 获取翻译
export const t = (key: string, lang: SupportedLanguage = 'zh-CN'): string => {
  // 优先使用动态加载的翻译
  if (dynamicTranslations[lang]) {
    const translation = getNestedValue(dynamicTranslations[lang], key)
    if (translation !== key) return translation
  }
  
  // 降级到内置翻译
  const builtInTranslation = builtInTranslations[lang] || builtInTranslations['zh-CN']
  return getNestedValue(builtInTranslation, key)
}

export default {
  t,
  initI18n
}
```

## 4. 设置模态框更新

### 4.1 语言下拉选项
修改 `GeneralSettings.tsx`，从设置的 `meta.language.languages` 中获取语言选项：

```typescript
// src/components/SettingsModal/tabs/GeneralSettings.tsx
import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'

function GeneralSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  // 其他现有代码...

  // 从 meta.language.languages 获取语言选项
  const languageOptions = [
    { value: 'system', label: t('settings.languageFollowSystem', language) },
    ...(settings.meta?.language?.languages.map(lang => ({
      value: lang.code,
      label: lang.name
    })) || [
      { value: 'zh-CN', label: t('settings.chinese', language) },
      { value: 'en', label: t('settings.english', language) },
      { value: 'ja', label: t('settings.japanese', language) }
    ])
  ]

  // 其他现有代码...
}

export default GeneralSettings
```

## 5. 插件初始化

### 5.1 初始化国际化
在 `main.tsx` 中初始化国际化：

```typescript
// src/main.tsx
import { t, initI18n } from './translations/i18n.ts'

const main = async () => {
  try {
    // 动态加载CSS文件
    await loadCSS()
    
    // 初始化国际化
    await initI18n()

    // 其他现有代码...
  } catch (error) {
    logger.error('Failed to initialize Text Toolkit Plugin:', error)
  }
}
```

## 6. 用户使用流程

### 6.1 添加新语言
1. 在 `dist/translations/` 目录中创建新的语言文件，如 `fr.json`
2. 修改 `settings.json` 文件，在 `meta.language.languages` 中添加新语言配置：

```json
{
  "meta": {
    "language": {
      "languages": [
        // 现有语言...
        {
          "code": "fr",
          "name": "Français",
          "path": "translations/fr.json"
        }
      ],
      "fallbackLanguage": "zh-CN"
    }
  }
}
```

3. 在 Logseq 中重新加载插件
4. 新语言将出现在设置的语言下拉选项中

### 6.2 自定义语言文件
1. 编辑 `dist/translations/` 目录中的语言文件
2. 在 Logseq 中重新加载插件
3. 新的翻译将立即生效

## 7. 技术优势

1. **灵活性**：用户可以轻松添加新语言和修改现有翻译
2. **实时反馈**：修改语言文件后重新加载插件即可生效
3. **降级机制**：当语言文件加载失败时，自动降级到内置语言
4. **可扩展性**：支持通过配置添加任意数量的语言
5. **兼容性**：保持与现有国际化系统的兼容

## 8. 实现注意事项

1. **文件路径**：语言文件路径必须是相对于插件根目录的相对路径
2. **文件格式**：语言文件必须是有效的 JSON 格式
3. **翻译键**：新添加的语言文件必须包含所有必要的翻译键
4. **性能**：首次加载时会异步加载语言文件，可能会有短暂的加载延迟
5. **错误处理**：当语言文件加载失败时，会自动降级到内置语言，确保插件正常运行

## 9. 测试计划

1. **基本功能测试**：测试现有语言的加载和使用
2. **新语言添加测试**：添加新语言并验证是否正确显示
3. **语言文件修改测试**：修改语言文件并验证修改是否生效
4. **降级机制测试**：删除语言文件并验证是否正确降级到内置语言
5. **性能测试**：测试语言文件加载的性能影响
