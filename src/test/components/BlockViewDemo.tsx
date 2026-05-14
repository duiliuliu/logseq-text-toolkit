import React from 'react'
import { BlockView } from '../../components/BlockView'
import { BlockViewConfig } from '../../lib/blockView/types'
import { BlockEntity } from '../../lib/heatmap/types'

const sampleBlocks: BlockEntity[] = [
  {
    'block/uuid': '6a027ff3-6924-40ff-8847-aa24c68d0b34',
    'block/marker': 'DONE',
    'block/content': '完成项目计划文档 #task',
    'block/page': { 'block/name': '周度总结-2026年第19周' },
    'block/created-at': '2026-05-10T08:00:00.000Z',
    'block/updated-at': '2026-05-12T15:30:00.000Z',
    'block/heading-level': 3,
    'block/collapsed?': false
  },
  {
    'block/uuid': '6a027ff3-0cc1-4be3-9656-ac3eedf104d3',
    'block/marker': 'DONE',
    'block/content': '设计UI界面原型 #task',
    'block/page': { 'block/name': '周度总结-2026年第19周' },
    'block/created-at': '2026-05-11T09:00:00.000Z',
    'block/updated-at': '2026-05-13T10:15:00.000Z',
    'block/heading-level': 4,
    'block/collapsed?': false
  },
  {
    'block/uuid': '6a027ff3-6174-401b-bf41-57e0c947c46a',
    'block/marker': 'DOING',
    'block/content': '实现核心功能模块 #task',
    'block/page': { 'block/name': '周度总结-2026年第19周' },
    'block/created-at': '2026-05-12T14:00:00.000Z',
    'block/updated-at': '2026-05-14T16:45:00.000Z',
    'block/heading-level': 4,
    'block/collapsed?': false
  },
  {
    'block/uuid': '6a027ff3-400e-467b-8018-a1701c7cc22e',
    'block/marker': 'TODO',
    'block/content': '编写测试用例 #task',
    'block/page': { 'block/name': '周度总结-2026年第19周' },
    'block/created-at': '2026-05-13T10:30:00.000Z',
    'block/updated-at': '2026-05-14T09:00:00.000Z',
    'block/heading-level': 4,
    'block/collapsed?': false
  },
  {
    'block/uuid': '6a027ff3-a77a-4f44-9c4b-224970d9a39a',
    'block/marker': 'TODO',
    'block/content': '部署到生产环境 #task',
    'block/page': { 'block/name': '周度总结-2026年第19周' },
    'block/created-at': '2026-05-14T08:00:00.000Z',
    'block/updated-at': '2026-05-14T08:00:00.000Z',
    'block/heading-level': 3,
    'block/collapsed?': false
  }
]

export const BlockViewDemo: React.FC = () => {
  const config: BlockViewConfig = {
    viewType: 'table',
    table: {
      theme: 'default',
      showRowStriped: true,
      showBorder: true,
      showColumns: ['marker', 'content', 'page', 'createdAt', 'updatedAt'],
      columnWidths: {
        marker: 80,
        content: 350,
        page: 200,
        createdAt: 180,
        updatedAt: 180
      }
    }
  }

  return (
    <div className="block-view-demo" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>📊 Block View 演示</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#666' }}>
        基于真实 Logseq 块数据结构，包含 marker、content、page、createdAt、updatedAt 等字段
      </p>
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
