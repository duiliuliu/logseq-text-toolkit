/**
 * AdvancedSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import AdvancedSettings from './AdvancedSettings'

// Mock the useSettings hook
vi.mock('../../../settings/useSettings', () => ({
  useSettings: () => ({
    settings: {
      advanced: {
        debugMode: false
      }
    },
    isLoading: false,
    isSaving: false,
    error: null,
    theme: 'light',
    saveSettings: async () => true,
    resetSettings: async () => true,
    setTheme: () => {}
  })
}))

describe('AdvancedSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 AdvancedSettings 组件', () => {
      const { container } = render(
        <AdvancedSettings />
      )
      
      expect(container).toBeTruthy()
    })
  })
})
