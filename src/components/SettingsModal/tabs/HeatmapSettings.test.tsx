/**
 * HeatmapSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import HeatmapSettings from './HeatmapSettings'

// Mock the useSettings hook
vi.mock('../../../settings/useSettings', () => ({
  useSettings: () => ({
    settings: {
      heatmap: {
        enabled: true,
        displayMode: 'year',
        containerWidth: '100%'
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

describe('HeatmapSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 HeatmapSettings 组件', () => {
      const { container } = render(
        <HeatmapSettings />
      )
      
      expect(container).toBeTruthy()
    })
  })
})
