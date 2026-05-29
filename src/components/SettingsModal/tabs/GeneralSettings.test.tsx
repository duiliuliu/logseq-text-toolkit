/**
 * GeneralSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import GeneralSettings from './GeneralSettings'

// Mock the useSettings hook
vi.mock('../../../settings/useSettings', () => ({
  useSettings: () => ({
    settings: {
      language: 'zh-CN',
      theme: 'light',
      showBorder: true
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

describe('GeneralSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 GeneralSettings 组件', () => {
      const { container } = render(
        <GeneralSettings />
      )
      
      expect(container).toBeTruthy()
    })
  })
})
