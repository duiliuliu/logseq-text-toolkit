import { describe, expectTypeOf, test } from 'vitest'
import { TranslationKey } from '../../translations/translations'

describe('TranslationKey type', () => {
  test('should accept valid translation keys', () => {
    const validKey1: TranslationKey = 'toolbar.bold'
    const validKey2: TranslationKey = 'settings.milestone.description'
    const validKey3: TranslationKey = 'settings.summary.aiProviderOpenAI'
    const validKey4: TranslationKey = 'settings.taskProgress.statusNames.todo'
    const validKey5: TranslationKey = 'inlineComment.placeholder'

    expectTypeOf(validKey1).toBeString()
    expectTypeOf(validKey2).toBeString()
    expectTypeOf(validKey3).toBeString()
    expectTypeOf(validKey4).toBeString()
    expectTypeOf(validKey5).toBeString()
  })
})