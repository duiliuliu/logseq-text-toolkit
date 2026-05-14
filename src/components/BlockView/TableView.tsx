import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BlockEntity } from '../../lib/heatmap/types';
import {
  TableConfig,
  PRESET_THEMES,
  DEFAULT_COLUMN_ORDER
} from '../../lib/blockView/types';
import './blockView.css';

interface TableViewProps {
  blocks: BlockEntity[];
  config: TableConfig;
  onColumnWidthChange?: (columnKey: string, width: number) => void;
}

const TableView: React.FC<TableViewProps> = ({
  blocks,
  config,
  onColumnWidthChange
}) => {
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    config.columnWidths || {}
  );
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const tableRef = useRef<HTMLTableElement>(null);
  const resizingRef = useRef<string | null>(null);

  // Get active theme - 获取激活的主题
  const activeTheme = useMemo(() => {
    if (config.theme === 'custom' && config.customTheme) {
      return { ...PRESET_THEMES.default, ...config.customTheme };
    }
    return PRESET_THEMES[config.theme as keyof typeof PRESET_THEMES] || PRESET_THEMES.default;
  }, [config.theme, config.customTheme]);

  // Column display order - 列显示顺序
  const columnsToShow = DEFAULT_COLUMN_ORDER;

  // Resize handlers - 调整大小处理
  const handleMouseDown = (e: React.MouseEvent, columnKey: string, initialWidth: number) => {
    e.preventDefault();
    setIsResizing(columnKey);
    resizingRef.current = columnKey;
    setStartX(e.clientX);
    setStartWidth(initialWidth || 100);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      setColumnWidths(prev => ({
        ...prev,
        [resizingRef.current!]: newWidth
      }));
    };

    const handleMouseUp = () => {
      if (resizingRef.current && onColumnWidthChange) {
        onColumnWidthChange(resizingRef.current, columnWidths[resizingRef.current]);
      }
      setIsResizing(null);
      resizingRef.current = null;
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, startX, startWidth, columnWidths, onColumnWidthChange]);

  // Get cell content - 获取单元格内容
  const getCellContent = (block: BlockEntity, columnKey: string) => {
    switch (columnKey) {
      case 'marker':
        return block['block/marker'] || '';
      case 'content':
        return block['block/content'] || '';
      case 'page':
        return block['block/page']?.['block/name'] || '';
      case 'createdAt':
        return block['block/created-at'] 
          ? new Date(block['block/created-at']).toLocaleString() 
          : '';
      case 'updatedAt':
        return block['block/updated-at']
          ? new Date(block['block/updated-at']).toLocaleString()
          : '';
      default:
        return '';
    }
  };

  // Get column header - 获取列标题
  const getColumnHeader = (columnKey: string) => {
    switch (columnKey) {
      case 'marker':
        return '状态';
      case 'content':
        return '内容';
      case 'page':
        return '页面';
      case 'createdAt':
        return '创建时间';
      case 'updatedAt':
        return '更新时间';
      default:
        return columnKey;
    }
  };

  // Table style - 表格样式
  const tableStyle: React.CSSProperties = {
    borderCollapse: 'separate',
    borderSpacing: 0,
    width: '100%',
    borderRadius: activeTheme.tableBorderRadius,
    overflow: 'hidden',
    border: config.showBorder ? `1px solid ${activeTheme.borderColor}` : 'none'
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: activeTheme.headerBgColor,
    color: activeTheme.headerTextColor,
    height: activeTheme.headerHeight
  };

  return (
    <div className="ttk-block-view-table-container">
      <table ref={tableRef} style={tableStyle} className="ttk-block-view-table">
        <thead>
          <tr style={headerStyle}>
            {columnsToShow.map((columnKey, index) => {
              const width = columnWidths[columnKey];
              return (
                <th
                  key={columnKey}
                  style={{
                    padding: activeTheme.cellPadding,
                    textAlign: 'left',
                    borderBottom: `1px solid ${activeTheme.headerBorderColor}`,
                    ...(width ? { width: `${width}px`, minWidth: `${width}px` } : {}),
                    position: 'relative'
                  }}
                >
                  {getColumnHeader(columnKey)}
                  {/* Resizer handle - 调整大小手柄 */}
                  <div
                    className="ttk-block-view-resizer"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: '5px',
                      cursor: 'col-resize',
                      backgroundColor: isResizing === columnKey ? '#3b82f6' : 'transparent'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, columnKey, width || 100)}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {blocks.map((block, index) => (
            <tr
              key={
                typeof block['block/uuid'] === 'string'
                  ? block['block/uuid']
                  : block['block/uuid']?.['$uuid$'] || index
              }
              style={{
                backgroundColor:
                  config.showRowStriped && index % 2 === 1
                    ? activeTheme.rowBgColor
                    : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = activeTheme.rowHoverBgColor || '';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  config.showRowStriped && index % 2 === 1
                    ? (activeTheme.rowBgColor || '')
                    : 'transparent';
              }}
            >
              {columnsToShow.map((columnKey) => {
                const width = columnWidths[columnKey];
                return (
                  <td
                    key={columnKey}
                    style={{
                      padding: activeTheme.cellPadding,
                      borderBottom: `1px solid ${activeTheme.rowBorderColor}`,
                      ...(width ? { width: `${width}px`, minWidth: `${width}px` } : {})
                    }}
                  >
                    {getCellContent(block, columnKey)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
