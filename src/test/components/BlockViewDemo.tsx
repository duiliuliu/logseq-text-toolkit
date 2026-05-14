import React from 'react'
import { BlockView } from '../../components/BlockView'
import { BlockViewConfig } from '../../lib/blockView/types'

const sampleBlocks = [
  {
    'block/uuid': 'block-1',
    'block/marker': 'DONE',
    'block/content': '完成项目计划文档 #task',
    'block/page': { 'block/name': 'Text Toolkit' },
    'block/created-at': Date.now() - 86400000 * 3,
    'block/updated-at': Date.now() - 86400000 * 2
  },
  {
    'block/uuid': 'block-2',
    'block/marker': 'TODO',
    'block/content': '设计UI界面原型 #task',
    'block/page': { 'block/name': 'Text Toolkit' },
    'block/created-at': Date.now() - 86400000 * 2,
    'block/updated-at': Date.now() - 86400000
  },
  {
    'block/uuid': 'block-3',
    'block/marker': 'DOING',
    'block/content': '实现核心功能模块 #task',
    'block/page': { 'block/name': 'Text Toolkit' },
    'block/created-at': Date.now() - 86400000,
    'block/updated-at': Date.now() - 3600000
  },
  {
    'block/uuid': 'block-4',
    'block/marker': 'WAITING',
    'block/content': '编写测试用例 #task',
    'block/page': { 'block/name': 'Text Toolkit' },
    'block/created-at': Date.now() - 3600000,
    'block/updated-at': Date.now() - 1800000
  },
  {
    'block/uuid': 'block-5',
    'block/marker': 'TODO',
    'block/content': '部署到生产环境 #task',
    'block/page': { 'block/name': 'Text Toolkit' },
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
      showBorder: true,
      showColumns: ['marker', 'content', 'page', 'createdAt', 'updatedAt'],
      columnWidths: {
        marker: 60,
        content: 300,
        page: 120,
        createdAt: 150,
        updatedAt: 150
      }
    }
  }

  return (
    <div className="block-view-demo" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>📊 Block View 演示</h3>
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
