/**
 * SummarySettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import SummarySettings from './SummarySettings'

// Mock the useSettings hook
vi.mock('../../../settings/useSettings', () => ({
  useSettings: () => ({
    settings: {
      summary: {
        enabled: true
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

describe('SummarySettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 SummarySettings 组件', () => {
      const { container } = render(
        <SummarySettings />
      )
      
      expect(container).toBeTruthy()
    })
  })
})
