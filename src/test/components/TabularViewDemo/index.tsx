/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Tabular View - 测试组件
 * 
 * 用于在 test 目录中演示表格视图功能
 */

import React from 'react'
import './tabularViewDemo.css'

// 模拟 Logseq Experiments API 返回的子块数据
const MOCK_TABLE_DATA = {
  blockId: 'demo-block',
  content: '项目管理 #tabular',
  children: [
    // 表头
    {
      content: '任务',
      title: '任务',
      children: [
        { content: '状态', title: '状态' },
        { content: '负责人', title: '负责人' },
        { content: '截止日期', title: '截止日期' },
        { content: '进度', title: '进度' }
      ]
    },
    // 数据行
    {
      content: '设计文档',
      title: '设计文档',
      children: [
        { content: '已完成', title: '已完成' },
        { content: '张三', title: '张三' },
        { content: '2024-01-15', title: '2024-01-15' },
        { content: '100%', title: '100%' }
      ]
    },
    {
      content: '开发代码',
      title: '开发代码',
      children: [
        { content: '进行中', title: '进行中' },
        { content: '李四', title: '李四' },
        { content: '2024-02-01', title: '2024-02-01' },
        { content: '65%', title: '65%' }
      ]
    },
    {
      content: '测试用例',
      title: '测试用例',
      children: [
        { content: '待开始', title: '待开始' },
        { content: '王五', title: '王五' },
        { content: '2024-02-15', title: '2024-02-15' },
        { content: '0%', title: '0%' }
      ]
    },
    {
      content: '部署上线',
      title: '部署上线',
      children: [
        { content: '待开始', title: '待开始' },
        { content: '赵六', title: '赵六' },
        { content: '2024-03-01', title: '2024-03-01' },
        { content: '0%', title: '0%' }
      ]
    }
  ]
}

const COMPACT_TABLE_DATA = {
  blockId: 'compact-demo',
  content: '数据监控 #tabular-compact',
  children: [
    { content: '服务器', children: [
      { content: 'CPU' },
      { content: '内存' },
      { content: '状态' }
    ] },
    { content: 'Server-01', children: [
      { content: '45%' },
      { content: '68%' },
      { content: '正常' }
    ] },
    { content: 'Server-02', children: [
      { content: '78%' },
      { content: '82%' },
      { content: '警告' }
    ] },
    { content: 'Server-03', children: [
      { content: '32%' },
      { content: '45%' },
      { content: '正常' }
    ] }
  ]
}

const NO_HEADER_DATA = {
  blockId: 'no-header-demo',
  content: '快速统计 #tabular0',
  children: [
    { content: '总用户', children: [ { content: '15,420' } ] },
    { content: '日活跃', children: [ { content: '4,321' } ] },
    { content: '月付费', children: [ { content: '2,105' } ] },
    { content: '收入', children: [ { content: '$89,450' } ] }
  ]
}

/**
 * 模拟表格渲染组件（不依赖 Logseq）
 */
function MockTabularRenderer({ data }: { data: any }) {
  const isCompactMode = data.content?.includes('#tabular-compact')
  const isNoHeaderMode = data.content?.includes('#tabular0')
  
  const headerRow = isNoHeaderMode ? null : data.children[0]
  const dataRows = isNoHeaderMode ? data.children : data.children.slice(1)
  
  const renderRow = (row: any, isHeader: boolean, rowIndex: number) => {
    const columns = row.children || []
    const cells = [
      <div key="title" className="tabular-cell tabular-title-cell">
        {row.content}
      </div>
    ]
    
    columns.forEach((col: any, colIndex: number) => {
      cells.push(
        <div key={`col-${colIndex}`} className="tabular-cell">
          {col.content}
        </div>
      )
    })
    
    return (
      <div 
        key={`row-${rowIndex}`} 
        className={`tabular-row ${isHeader ? 'tabular-header' : ''} ${isCompactMode ? 'tabular-compact' : ''}`}
      >
        {cells}
      </div>
    )
  }
  
  const rows: JSX.Element[] = []
  if (headerRow) {
    rows.push(renderRow(headerRow, true, 0))
  }
  dataRows.forEach((row: any, index: number) => {
    rows.push(renderRow(row, false, index + (headerRow ? 1 : 0)))
  })
  
  return (
    <div className={`tabular-container ${isCompactMode ? 'tabular-compact' : ''}`}>
      {!isNoHeaderMode && data.content && (
        <div className="tabular-title">
          {data.content.replace('#tabular', '').replace('#tabular-compact', '').trim()}
        </div>
      )}
      {rows}
    </div>
  )
}

/**
 * 演示页面
 */
export function TabularViewDemo() {
  return (
    <div className="tabular-demo-container">
      <div className="demo-header">
        <h1>Tabular View - 表格视图插件</h1>
        <p>基于 Logseq Experiments API 的实现方案</p>
      </div>
      
      <section className="demo-section">
        <h2>📊 标准表格模式</h2>
        <p>使用 &lt;#tabular&gt; 标签</p>
        <MockTabularRenderer data={MOCK_TABLE_DATA} />
      </section>
      
      <section className="demo-section">
        <h2>📋 紧凑模式</h2>
        <p>使用 &lt;#tabular-compact&gt; 标签</p>
        <MockTabularRenderer data={COMPACT_TABLE_DATA} />
      </section>
      
      <section className="demo-section">
        <h2>📈 无表头模式</h2>
        <p>使用 &lt;#tabular0&gt; 标签</p>
        <MockTabularRenderer data={NO_HEADER_DATA} />
      </section>
      
      <section className="demo-section">
        <h2>📝 使用说明</h2>
        <ul>
          <li><strong>斜杠命令</strong>: /Insert Tabular View</li>
          <li><strong>快捷键</strong>: Mod + Shift + T</li>
          <li><strong>右键菜单</strong>: Toggle Tabular View</li>
        </ul>
      </section>
    </div>
  )
}
