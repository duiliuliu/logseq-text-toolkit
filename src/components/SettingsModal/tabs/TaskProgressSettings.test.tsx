/**
 * TaskProgressSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import TaskProgressSettings from './TaskProgressSettings'

// Mock the useSettings hook
vi.mock('../../../settings/useSettings', () => ({
  useSettings: () => ({
    settings: {
      taskProgress: {
        enabled: true,
        defaultDisplayType: 'mini-circle',
        fireworksOnComplete: true
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

describe('TaskProgressSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 TaskProgressSettings 组件', () => {
      const { container } = render(
        <TaskProgressSettings />
      )
      
      expect(container).toBeTruthy()
    })
  })
})
