/**
 * ToolbarSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import ToolbarSettings from './ToolbarSettings'

// Mock the useSettings hook
vi.mock('../../../settings/useSettings', () => ({
  useSettings: () => ({
    settings: {
      ToolbarItems: [],
      showBorder: true,
      width: '100px',
      height: '24px',
      hoverDelay: 500,
      sponsorEnabled: false
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

describe('ToolbarSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 ToolbarSettings 组件', () => {
      const { container } = render(
        <ToolbarSettings />
      )
      
      expect(container).toBeTruthy()
    })
  })
})
