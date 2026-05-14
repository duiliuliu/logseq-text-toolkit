
import React, { useState } from 'react';
import { ViewType, VIEW_REGISTRY, TableTheme } from '../../lib/blockView/types';
import '../../components/BlockView/blockView.css';

const logger = {
  debug: (message: string, data?: any) => {
    console.log(`[BlockViewDemo DEBUG] ${message}`, data || '');
  },
  info: (message: string, data?: any) => {
    console.log(`[BlockViewDemo INFO] ${message}`, data || '');
  }
};

export const BlockViewDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [currentTheme, setCurrentTheme] = useState<TableTheme>('default');
  const [showStriped, setShowStriped] = useState(true);
  const [showBorder, setShowBorder] = useState(true);

  logger.debug('Component mounted', { currentView, currentTheme });

  const handleViewChange = (viewType: ViewType) => {
    logger.debug('View button clicked', { 
      previousView: currentView, 
      newView: viewType,
      timestamp: new Date().toISOString()
    });
    setCurrentView(viewType);
    logger.info('View changed successfully', { newView: viewType });
  };

  const renderIcon = (iconSvg: string) => {
    return (
      <span 
        dangerouslySetInnerHTML={{ __html: iconSvg }}
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          width: '14px',
          height: '14px'
        }}
      />
    );
  };

  const getBlockClasses = () => {
    let classes = `ls-block swipe-item ltt-${currentView}-root`;
    if (currentView === 'table') {
      classes += ` ltt-theme-${currentTheme}`;
      if (showStriped) classes += ' ltt-striped';
      if (showBorder) classes += ' ltt-bordered';
    }
    return classes;
  };

  const renderBlockHTML = () => {
    const html = `<div haschild="true" class="${getBlockClasses()}" level="0" blockid="6a03f979-2728-4739-bf02-399ca07cb19c" id="ls-block-6a03f979-2728-4739-bf02-399ca07cb19c" containerid="1">
    <div class="block-main-container flex flex-row gap-1">
        <div class="block-control-wrap flex flex-row items-center h-6"><a
                id="control-6a03f979-2728-4739-bf02-399ca07cb19c" class="block-control"><span class="control-hide"><span
                        class="rotating-arrow not-collapsed"><svg aria-hidden="true" version="1.1" viewBox="0 0 192 512"
                            fill="currentColor" display="inline-block" class="h-4 w-4" style="margin-left: 2px;">
                            <path
                                d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"
                                fill-rule="evenodd"></path>
                        </svg></span></span></a><a class="bullet-link-wrap" data-state="closed"><span
                    id="dot-6a03f979-2728-4739-bf02-399ca07cb19c" blockid="6a03f979-2728-4739-bf02-399ca07cb19c"
                    draggable="true" class="bullet-container cursor "><span
                        blockid="6a03f979-2728-4739-bf02-399ca07cb19c" class="bullet"></span></span></a></div>
        <div class="flex flex-col w-full">
            <div class="flex flex-col w-full">
                <div class="block-main-content flex flex-row gap-2">
                    <div class="flex flex-col w-full">
                        <div class="block-content-or-editor-wrap ">
                            <div class="block-content-or-editor-inner">
                                <div class="block-row flex flex-1 flex-row gap-1 items-center">
                                    <div class="flex flex-1 w-full block-content-wrapper" style="display: flex;">
                                        <div id="block-content-6a03f979-2728-4739-bf02-399ca07cb19c"
                                            blockid="6a03f979-2728-4739-bf02-399ca07cb19c" containerid="1"
                                            data-type="default" class="block-content inline " style="width: 100%;">
                                            <div class="flex flex-row justify-between block-content-inner">
                                                <div class="block-head-wrap">
                                                    <div class="w-full inline"><span class="block-title-wrap">Block View Demo
                                                            - Table Header</span></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex flex-row items-center"></div>
                                    </div>
                                    <div class="ls-block-right flex flex-row items-center self-start gap-1">
                                        <div class="opacity-70 hover:opacity-100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div style="padding-left: 45px;"></div>
    <div class="block-children-container flex">
        <div class="block-children-left-border"></div>
        <div class="block-children w-full">
            <div data-level="1" class="blocks-list-wrap">
                <div haschild="false" class="ls-block swipe-item" level="1"
                    blockid="child1" id="ls-block-child1" containerid="1">
                    <div class="block-main-container flex flex-row gap-1">
                        <div class="block-control-wrap flex flex-row items-center h-6">
                            <a id="control-child1" class="block-control"><span class="control-hide"><span
                                        class="rotating-arrow not-collapsed"></span></span></a>
                            <a class="bullet-link-wrap" data-state="closed">
                                <span id="dot-child1" blockid="child1" draggable="true"
                                    class="bullet-container cursor">
                                    <span blockid="child1" class="bullet"></span>
                                </span>
                            </a>
                        </div>
                        <div class="flex flex-col w-full">
                            <div class="flex flex-col w-full">
                                <div class="block-main-content flex flex-row gap-2">
                                    <div class="flex flex-col w-full">
                                        <div class="block-content-or-editor-wrap ">
                                            <div class="block-content-or-editor-inner">
                                                <div class="block-row flex flex-1 flex-row gap-1 items-center">
                                                    <div class="flex flex-1 w-full block-content-wrapper" style="display: flex;">
                                                        <div id="block-content-child1"
                                                            blockid="child1" containerid="1"
                                                            data-type="default" class="block-content inline " style="width: 100%;">
                                                            <div class="flex flex-row justify-between block-content-inner">
                                                                <div class="block-head-wrap">
                                                                    <div class="w-full inline">
                                                                        <span class="block-title-wrap">
                                                                            这是纵轴表头一：维度
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="flex flex-row items-center"></div>
                                                    </div>
                                                    <div class="ls-block-right flex flex-row items-center self-start gap-1">
                                                        <div class="opacity-70 hover:opacity-100"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="padding-left: 45px;"></div>
                </div>
                <div haschild="false" class="ls-block swipe-item" level="1"
                    blockid="child2" id="ls-block-child2" containerid="1">
                    <div class="block-main-container flex flex-row gap-1">
                        <div class="block-control-wrap flex flex-row items-center h-6">
                            <a id="control-child2" class="block-control"><span class="control-hide"><span
                                        class="rotating-arrow not-collapsed"></span></span></a>
                            <a class="bullet-link-wrap" data-state="closed">
                                <span id="dot-child2" blockid="child2" draggable="true"
                                    class="bullet-container cursor">
                                    <span blockid="child2" class="bullet"></span>
                                </span>
                            </a>
                        </div>
                        <div class="flex flex-col w-full">
                            <div class="flex flex-col w-full">
                                <div class="block-main-content flex flex-row gap-2">
                                    <div class="flex flex-col w-full">
                                        <div class="block-content-or-editor-wrap ">
                                            <div class="block-content-or-editor-inner">
                                                <div class="block-row flex flex-1 flex-row gap-1 items-center">
                                                    <div class="flex flex-1 w-full block-content-wrapper" style="display: flex;">
                                                        <div id="block-content-child2"
                                                            blockid="child2" containerid="1"
                                                            data-type="default" class="block-content inline " style="width: 100%;">
                                                            <div class="flex flex-row justify-between block-content-inner">
                                                                <div class="block-head-wrap">
                                                                    <div class="w-full inline">
                                                                        <span class="block-title-wrap">
                                                                            这是纵轴表头二：代码结构
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="flex flex-row items-center"></div>
                                                    </div>
                                                    <div class="ls-block-right flex flex-row items-center self-start gap-1">
                                                        <div class="opacity-70 hover:opacity-100"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="padding-left: 45px;"></div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    return html;
  };

  logger.debug('Rendering BlockViewDemo', { 
    currentView, 
    viewRegistryKeys: Object.keys(VIEW_REGISTRY) 
  });

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginBottom: '16px' }}>Block View Demo - Current: {currentView}</h3>
      
      {/* View Switcher */}
      <div className="ltt-view-bar" style={{ marginBottom: '16px' }}>
        {Object.values(VIEW_REGISTRY).map((viewConfig) => (
          <button
            key={viewConfig.id}
            className={`ltt-view-btn ${currentView === viewConfig.id ? 'active' : ''}`}
            onClick={() => handleViewChange(viewConfig.id)}
            title={viewConfig.name}
          >
            {renderIcon(viewConfig.icon)}
            <span style={{ marginLeft: '4px', fontSize: '12px' }}>{viewConfig.name}</span>
          </button>
        ))}
      </div>

      {/* Theme Switcher (for table view) */}
      {currentView === 'table' && (
        <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid var(--ls-border-color, #e5e7eb)', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Table Theme Settings</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {(['default', 'notion', 'linear', 'dark', 'gradient'] as TableTheme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => setCurrentTheme(theme)}
                style={{
                  padding: '6px 12px',
                  border: currentTheme === theme ? '2px solid var(--ls-primary-color)' : '1px solid var(--ls-border-color)',
                  borderRadius: '4px',
                  backgroundColor: currentTheme === theme ? 'var(--ls-primary-color)' : 'transparent',
                  color: currentTheme === theme ? 'white' : 'var(--ls-primary-text-color)',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={showStriped}
                onChange={(e) => setShowStriped(e.target.checked)}
              />
              Show Striped
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={showBorder}
                onChange={(e) => setShowBorder(e.target.checked)}
              />
              Show Border
            </label>
          </div>
        </div>
      )}

      {/* Block Render */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#fff',
        }}
        dangerouslySetInnerHTML={{ __html: renderBlockHTML() }}
      />
    </div>
  );
};
