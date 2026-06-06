/**
 * MindMap 预设主题配置
 */

import type { MindMapTheme, MindMapColorScheme } from './types';

/**
 * 默认配色方案
 */
const defaultScheme: MindMapColorScheme = {
  nodeBorderColor: '#e2e8f0',
  nodeBorderWidth: '1px',
  nodeBorderRadius: '6px',
  nodeBackgroundColor: '#ffffff',
  nodeHoverBackgroundColor: '#f8fafc',
  textColor: '#374151',
  textHoverColor: '#1f2937',
  fontSize: '14px',
  fontWeight: '400',
  lineColor: '#cbd5e1',
  lineWidth: '2px',
  lineStyle: 'solid',
  backgroundColor: 'transparent',
  buttonColor: '#9ca3af',
  buttonHoverColor: '#374151',
};

/**
 * 预设主题列表
 */
export const MIND_MAP_THEMES: Record<string, MindMapTheme> = {
  pure: {
    name: 'pure',
    label: '纯境',
    labelEn: 'Pure',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: 'transparent',
      lineColor: '#e5e7eb',
    },
  },
  outline: {
    name: 'outline',
    label: '明线',
    labelEn: 'Outline',
    scheme: {
      ...defaultScheme,
      nodeBorderRadius: '0px',
      lineColor: '#d1d5db',
    },
  },
  plain: {
    name: 'plain',
    label: '素页',
    labelEn: 'Plain',
    scheme: {
      ...defaultScheme,
      nodeBackgroundColor: '#1f2937',
      nodeHoverBackgroundColor: '#374151',
      textColor: '#f9fafb',
      textHoverColor: '#ffffff',
      lineColor: '#4b5563',
    },
  },
  ink: {
    name: 'ink',
    label: '墨稿',
    labelEn: 'Ink',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#d1d5db',
      nodeBorderRadius: '4px',
      lineColor: '#e5e7eb',
    },
  },
  parchment: {
    name: 'parchment',
    label: '雁皮',
    labelEn: 'Parchment',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#d6d3d1',
      nodeBackgroundColor: '#fafaf9',
      nodeHoverBackgroundColor: '#f5f5f4',
      textColor: '#44403c',
      lineColor: '#d6d3d1',
    },
  },
  mist: {
    name: 'mist',
    label: '薄雾',
    labelEn: 'Mist',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#94a3b8',
      nodeBackgroundColor: '#f8fafc',
      nodeHoverBackgroundColor: '#f1f5f9',
      textColor: '#1e293b',
      lineColor: '#cbd5e1',
    },
  },
  focus: {
    name: 'focus',
    label: '焦点',
    labelEn: 'Focus',
    scheme: {
      ...defaultScheme,
      nodeBackgroundColor: '#111827',
      nodeHoverBackgroundColor: '#1f2937',
      textColor: '#d1d5db',
      textHoverColor: '#ffffff',
      lineColor: '#374151',
    },
  },
  deep: {
    name: 'deep',
    label: '深潜',
    labelEn: 'Deep',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#6366f1',
      nodeBackgroundColor: '#0f172a',
      nodeHoverBackgroundColor: '#1e293b',
      textColor: '#c7d2fe',
      lineColor: '#4f46e5',
    },
  },
  night: {
    name: 'night',
    label: '夜图',
    labelEn: 'Night',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#a855f7',
      nodeBackgroundColor: '#18181b',
      nodeHoverBackgroundColor: '#27272a',
      textColor: '#ddd6fe',
      lineColor: '#7c3aed',
    },
  },
};
