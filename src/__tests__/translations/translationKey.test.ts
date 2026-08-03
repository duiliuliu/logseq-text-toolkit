import { describe, expect, expectTypeOf, test } from 'vitest'
import { TranslationKey } from '../../translations/translations'
import { t } from '../../translations/i18n'

describe('TranslationKey type', () => {
  test('should accept valid translation keys', () => {
    const validKey1: TranslationKey = 'toolbar.bold'
    const validKey2: TranslationKey = 'settings.milestone.description'
    const validKey3: TranslationKey = 'settings.summary.aiProviderOpenAI'
    const validKey4: TranslationKey = 'settings.taskProgress.statusNames.todo'
    const validKey5: TranslationKey = 'inlineComment.placeholder'
    const validKey6: TranslationKey = 'toolbar.pluginNotInstalled'

    expectTypeOf(validKey1).toBeString()
    expectTypeOf(validKey2).toBeString()
    expectTypeOf(validKey3).toBeString()
    expectTypeOf(validKey4).toBeString()
    expectTypeOf(validKey5).toBeString()
    expectTypeOf(validKey6).toBeString()
  })

  test('should interpolate translation parameters', () => {
    expect(t('toolbar.pluginNotInstalled', 'zh-CN', { pluginId: 'demo-plugin' })).toBe(
      '外部插件 demo-plugin 未安装或已禁用'
    )
  })

  test('should support legacy parameter order for interpolation', () => {
    expect(t('toolbar.pluginNotInstalled', { pluginId: 'demo-plugin' }, 'zh-CN')).toBe(
      '外部插件 demo-plugin 未安装或已禁用'
    )
  })
})
