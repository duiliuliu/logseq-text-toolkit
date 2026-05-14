import React from 'react'
import { BlockView } from '../../components/BlockView'
import { BlockViewConfig } from '../../lib/blockView/types'

const sampleBlocks = [
  {
    'block/uuid': '6a027ff3-6924-40ff-8847-aa24c68d0b34',
    'block/marker': 'TODO',
    'block/content': '创建块数: 156',
    'block/page': { 'block/name': '周度总结 - 2026年第19周' },
    'block/created-at': Date.now() - 86400000 * 3,
    'block/updated-at': Date.now() - 86400000 * 2
  },
  {
    'block/uuid': '6a027ff3-0cc1-4be3-9656-ac3eedf104d3',
    'block/marker': 'DONE',
    'block/content': '完成任务: 28 / 35',
    'block/page': { 'block/name': '周度总结 - 2026年第19周' },
    'block/created-at': Date.now() - 86400000 * 2,
    'block/updated-at': Date.now() - 86400000
  },
  {
    'block/uuid': '6a027ff3-6174-401b-bf41-57e0c947c46a',
    'block/marker': 'DOING',
    'block/content': '活跃天数: 6 / 7',
    'block/page': { 'block/name': '周度总结 - 2026年第19周' },
    'block/created-at': Date.now() - 86400000,
    'block/updated-at': Date.now() - 3600000
  },
  {
    'block/uuid': '6a027ff3-400e-467b-8018-a1701c7cc22e',
    'block/marker': 'TODO',
    'block/content': '新增页面: 12',
    'block/page': { 'block/name': '周度总结 - 2026年第19周' },
    'block/created-at': Date.now() - 3600000,
    'block/updated-at': Date.now() - 1800000
  },
  {
    'block/uuid': '6a027ff3-fbf0-4989-871b-ed6afca27c4a',
    'block/marker': 'WAITING',
    'block/content': '活跃度热力图 - 展示本周活跃情况',
    'block/page': { 'block/name': '周度总结 - 2026年第19周' },
    'block/created-at': Date.now() - 1800000,
    'block/updated-at': Date.now() - 60000
  }
]

export const BlockViewDemo: React.FC = () => {
  const config: BlockViewConfig = {
    viewType: 'table',
    table: {
      theme: 'default',
      showRowStriped: true,
      showBorder: true
    }
  }

  return (
    <div className="block-view-demo" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>📊 Block View 演示</h3>
      <div style={{ marginBottom: '12px', fontSize: '12px', color: '#666' }}>
        示例数据来自 Logseq 真实块结构，包含 marker、content、page、createdAt、updatedAt 等字段
      </div>
      <div id="block-view-demo-container" style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '6px' }}>
        <BlockView
          blocks={sampleBlocks as any}
          config={config}
          onBlockId="demo-block-id"
        />
      </div>
    </div>
  )
}
