import React, { useState, useEffect, useCallback } from 'react';
import { BlockEntity } from '../../lib/heatmap/types';
import {
  BlockViewType,
  BlockViewConfig,
  VIEW_TYPE_MAP,
  PRESET_THEMES,
  DEFAULT_COLUMNS
} from '../../lib/blockView/types';
import { updateBlockViewArgs } from '../../lib/blockView/register';
import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import logger from '../../lib/logger';
import TableView from './TableView';
import './blockView.css';

interface BlockViewProps {
  blocks: BlockEntity[];
  config: BlockViewConfig;
  onBlockId?: string;
}

const BlockView: React.FC<BlockViewProps> = ({
  blocks,
  config,
  onBlockId
}) => {
  const [currentViewType, setCurrentViewType] = useState<BlockViewType>(
    config.viewType
  );

  useEffect(() => {
    setCurrentViewType(config.viewType);
  }, [config.viewType]);

  const handleViewTypeChange = useCallback(async (viewType: BlockViewType) => {
    setCurrentViewType(viewType);
    if (onBlockId) {
      try {
        const currentBlock = await logseqAPI.Editor.getBlock(onBlockId);
        if (currentBlock) {
          const content = currentBlock.content || '';
          const updatedContent = updateBlockViewArgs(content, { view: viewType });
          await logseqAPI.Editor.updateBlock(onBlockId, updatedContent);
          logger.debug('[BlockView] View type updated', { onBlockId, viewType });
        }
      } catch (err) {
        logger.error('[BlockView] Failed to update view type:', err);
      }
    }
  }, [onBlockId]);

  const handleTableColumnWidthChange = useCallback(async (columnKey: string, width: number, currentWidths: any) => {
    if (onBlockId) {
      try {
        const currentBlock = await logseqAPI.Editor.getBlock(onBlockId);
        if (currentBlock) {
          const content = currentBlock.content || '';
          const newWidths = {
            ...currentWidths,
            [columnKey]: width
          };
          const updatedContent = updateBlockViewArgs(content, {
            colWidths: JSON.stringify(newWidths)
          });
          await logseqAPI.Editor.updateBlock(onBlockId, updatedContent);
          logger.debug('[BlockView] Column width updated', { onBlockId, columnKey, width });
        }
      } catch (err) {
        logger.error('[BlockView] Failed to update column width:', err);
      }
    }
  }, [onBlockId]);

  const renderContent = () => {
    switch (currentViewType) {
      case 'table':
        return (
          <TableView
            blocks={blocks}
            config={config.table || {
              theme: 'default',
              showRowStriped: true,
              showBorder: true,
              showColumns: DEFAULT_COLUMNS,
              columnWidths: config.table?.columnWidths
            }}
            onColumnWidthChange={(columnKey: string, width: number) => 
              handleTableColumnWidthChange(columnKey, width, config.table?.columnWidths)
            }
          />
        );
      case 'list':
      case 'card':
      case 'timeline':
        // TODO: 实现其他视图
        return (
          <div className="ttk-block-view-placeholder">
            {currentViewType} 视图开发中...
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="ttk-block-view-container">
      {/* View type bar - 视图切换条 */}
      <div className="ttk-block-view-viewbar">
        <button
          className={`ttk-block-view-viewbar-btn ${
            currentViewType === 'table' ? 'active' : ''
          }`}
          onClick={() => handleViewTypeChange('table')}
        >
          表格
        </button>
        <button
          className={`ttk-block-view-viewbar-btn ${
            currentViewType === 'list' ? 'active' : ''
          }`}
          onClick={() => handleViewTypeChange('list')}
        >
          列表
        </button>
        <button
          className={`ttk-block-view-viewbar-btn ${
            currentViewType === 'card' ? 'active' : ''
          }`}
          onClick={() => handleViewTypeChange('card')}
        >
          卡片
        </button>
        <button
          className={`ttk-block-view-viewbar-btn ${
            currentViewType === 'timeline' ? 'active' : ''
          }`}
          onClick={() => handleViewTypeChange('timeline')}
        >
          时间线
        </button>
      </div>

      {/* Render content - 渲染内容 */}
      {renderContent()}
    </div>
  );
};

export default BlockView;
