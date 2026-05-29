# 国际化改进方案

## 1. 当前实现分析

### 1.1 现有架构
- **翻译文件**: `/workspace/src/translations/` 目录下有 `en.json`、`ja.json`、`zh-CN.json` 三个语言文件
- **核心函数**: `i18n.ts` 中的 `t()` 函数用于获取翻译
- **类型定义**: `translations.ts` 中定义了翻译键和支持的语言类型

### 1.2 存在的问题
1. **硬编码语言**: 多处代码中直接使用硬编码的语言代码（如 `'zh-CN'`）
2. **缺乏动态切换**: 无法在运行时动态切换语言
3. **翻译键管理**: 翻译键分散在各个组件中，难以管理
4. **错误处理**: 当翻译键不存在时，直接返回键名，用户体验差
5. **语言包加载**: 所有语言包一次性加载，增加初始加载时间
6. **缺少语言检测**: 没有自动检测用户系统语言的功能

## 2. 改进方案

### 2.1 目标
- 实现运行时语言动态切换
- 统一国际化调用方式
- 优化语言包管理和加载
- 提高国际化的可维护性
- 增强用户体验

### 2.2 核心改进措施

#### 2.2.1 国际化状态管理
- **创建国际化上下文**:
  - 创建 `I18nContext` 用于管理当前语言状态
  - 提供 `useI18n` hook 方便组件使用
  - 实现语言切换功能

#### 2.2.2 语言包管理
- **按需加载语言包**:
  - 使用动态导入实现语言包的按需加载
  - 减少初始加载时间
- **语言包结构优化**:
  - 按模块组织翻译键，提高可维护性
  - 支持嵌套结构，便于分类管理

#### 2.2.3 统一国际化调用
- **增强 t() 函数**:
  - 自动使用当前上下文的语言
  - 支持占位符替换
  - 提供默认值选项
  - 改进错误处理
- **添加格式化函数**:
  - 日期格式化
  - 数字格式化
  - 货币格式化

#### 2.2.4 语言检测与默认值
- **系统语言检测**:
  - 自动检测用户系统语言
  - 提供语言选择回退机制
- **默认语言设置**:
  - 支持用户自定义默认语言
  - 保存用户语言偏好

#### 2.2.5 开发工具与工作流
- **翻译键自动提取**:
  - 开发工具自动提取代码中的翻译键
  - 生成翻译模板文件
- **翻译管理工具**:
  - 提供翻译状态管理
  - 支持团队协作翻译

## 3. 技术实现

### 3.1 目录结构
```
src/
├── translations/
│   ├── index.ts          # 国际化核心模块
│   ├── i18n.ts           # 国际化函数
│   ├── context.ts        # 国际化上下文
│   ├── types.ts          # 类型定义
│   ├── utils.ts          # 工具函数
│   ├── languages/        # 语言包目录
│   │   ├── en.ts         # 英语
│   │   ├── ja.ts         # 日语
│   │   ├── zh-CN.ts      # 简体中文
│   │   └── index.ts      # 语言包导出
│   └── formats/          # 格式化相关
│       ├── date.ts       # 日期格式化
│       ├── number.ts     # 数字格式化
│       └── currency.ts   # 货币格式化
└── components/
    └── I18n/             # 国际化相关组件
        ├── LanguageSelector.tsx  # 语言选择器
        └── index.ts
```

### 3.2 核心代码实现

#### 3.2.1 国际化上下文 (`context.ts`)
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, loadLanguage } from './languages';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('zh-CN');
  const [isLoading, setIsLoading] = useState(false);

  // 初始化时检测系统语言
  useEffect(() => {
    const detectLanguage = () => {
      const systemLang = navigator.language || 'zh-CN';
      const supportedLang: SupportedLanguage = ['zh-CN', 'en', 'ja'].includes(systemLang) 
        ? systemLang as SupportedLanguage 
        : 'zh-CN';
      setLanguage(supportedLang);
    };

    detectLanguage();
  }, []);

  // 语言切换时加载语言包
  useEffect(() => {
    const loadLang = async () => {
      setIsLoading(true);
      try {
        await loadLanguage(language);
      } catch (error) {
        console.error('Failed to load language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLang();
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
```

#### 3.2.2 国际化函数 (`i18n.ts`)
```typescript
import { SupportedLanguage, translations } from './languages';
import { useI18n } from './context';

// 递归获取翻译值
const getNestedValue = (obj: any, key: string): string => {
  if (!obj || !key) return key;
  const keys = key.split('.');
  let result = obj;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key;
    }
  }

  return result as string;
};

// 格式化带占位符的翻译
const formatTranslation = (translation: string, values: Record<string, any>): string => {
  return translation.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
};

// 获取翻译
export const t = (key: string, options?: {
  lang?: SupportedLanguage;
  values?: Record<string, any>;
  defaultValue?: string;
}): string => {
  const { lang, values, defaultValue } = options || {};
  
  // 如果没有指定语言，尝试从上下文获取
  let currentLang: SupportedLanguage = lang || 'zh-CN';
  
  try {
    // 尝试使用 React Context 获取当前语言
    const { language } = useI18n();
    currentLang = lang || language;
  } catch (error) {
    // 非 React 环境下使用默认语言
  }

  const translation = translations[currentLang] || translations['zh-CN'];
  const value = getNestedValue(translation, key);
  
  // 如果找不到翻译，使用默认值
  if (value === key && defaultValue) {
    return defaultValue;
  }
  
  // 格式化翻译
  if (values) {
    return formatTranslation(value, values);
  }
  
  return value;
};

// 日期格式化
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  try {
    const { language } = useI18n();
    return new Intl.DateTimeFormat(language, options).format(new Date(date));
  } catch (error) {
    return new Date(date).toLocaleString();
  }
};

// 数字格式化
export const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
  try {
    const { language } = useI18n();
    return new Intl.NumberFormat(language, options).format(number);
  } catch (error) {
    return number.toString();
  }
};

// 货币格式化
export const formatCurrency = (amount: number, currency: string = 'CNY'): string => {
  try {
    const { language } = useI18n();
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount}`;
  }
};

export default {
  t,
  formatDate,
  formatNumber,
  formatCurrency
};
```

#### 3.2.3 语言包管理 (`languages/index.ts`)
```typescript
export type SupportedLanguage = 'zh-CN' | 'en' | 'ja';

export interface TranslationKeys {
  [key: string]: string | TranslationKeys;
}

export interface Translations {
  [lang in SupportedLanguage]: TranslationKeys;
}

// 语言包缓存
export const translations: Translations = {
  'zh-CN': {},
  'en': {},
  'ja': {}
};

// 按需加载语言包
export const loadLanguage = async (lang: SupportedLanguage): Promise<void> => {
  if (Object.keys(translations[lang]).length > 0) {
    // 语言包已加载
    return;
  }

  try {
    const module = await import(`./${lang}.ts`);
    translations[lang] = module.default;
  } catch (error) {
    console.error(`Failed to load language ${lang}:`, error);
  }
};

// 预加载所有语言包（可选）
export const preloadAllLanguages = async (): Promise<void> => {
  const languages: SupportedLanguage[] = ['zh-CN', 'en', 'ja'];
  await Promise.all(languages.map(loadLanguage));
};
```

### 3.3 使用示例

#### 3.3.1 在组件中使用
```typescript
import React from 'react';
import { useI18n, t, formatDate } from '../../translations';
import LanguageSelector from '../../components/I18n/LanguageSelector';

const MyComponent: React.FC = () => {
  const { language, setLanguage } = useI18n();

  return (
    <div>
      <LanguageSelector />
      <h1>{t('toolbar.title')}</h1>
      <p>{t('toolbar.description', {
        values: { name: 'Text Toolkit' }
      })}</p>
      <p>{formatDate(new Date())}</p>
    </div>
  );
};

export default MyComponent;
```

#### 3.3.2 在非组件环境中使用
```typescript
import { t } from '../../translations';

const message = t('toolbar.noSelection', {
  lang: 'en',
  defaultValue: 'No text selected'
});
```

## 4. 实施计划

### 4.1 阶段一：核心架构搭建
1. 创建国际化上下文和核心函数
2. 重构语言包结构
3. 实现按需加载功能

### 4.2 阶段二：组件集成
1. 在所有组件中集成新的国际化方案
2. 替换硬编码的语言代码
3. 添加语言选择器组件

### 4.3 阶段三：工具与优化
1. 开发翻译键提取工具
2. 优化语言切换性能
3. 添加更多格式化功能

### 4.4 阶段四：测试与完善
1. 测试所有语言的翻译
2. 验证语言切换功能
3. 优化错误处理
4. 完善文档

## 5. 预期效果

- **用户体验提升**: 支持多语言切换，自动检测系统语言
- **开发效率提高**: 统一的国际化调用方式，减少重复代码
- **维护性增强**: 按模块组织翻译键，便于管理
- **性能优化**: 按需加载语言包，减少初始加载时间
- **扩展性更好**: 易于添加新语言和翻译键

## 6. 风险评估

### 6.1 潜在风险
1. **兼容性问题**: 旧的国际化代码可能与新方案冲突
2. **性能影响**: 动态加载语言包可能增加运行时开销
3. **翻译完整性**: 可能有遗漏的翻译键

### 6.2 缓解措施
1. **渐进式迁移**: 逐步替换旧的国际化代码
2. **缓存策略**: 缓存已加载的语言包
3. **自动化工具**: 使用工具检测遗漏的翻译键
4. **回退机制**: 当翻译不存在时使用默认值

## 7. 结论

通过实施这个国际化改进方案，可以显著提升应用的国际化能力，为用户提供更好的多语言体验，同时提高代码的可维护性和扩展性。方案采用现代化的 React 上下文 API 和动态导入技术，确保了良好的性能和用户体验。