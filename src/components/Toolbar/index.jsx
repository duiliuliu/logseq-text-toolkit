import React, { useState } from 'react'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontalIcon } from 'lucide-react'
import './toolbar.css'

function Toolbar({ items }) {
  const [hoveredItem, setHoveredItem] = useState(null)
  const [mouseOverGroup, setMouseOverGroup] = useState(null)

  const parseItems = (data) => {
    const result = []
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && !value.label) {
        const groupItems = []
        for (const [groupKey, groupValue] of Object.entries(value)) {
          if (groupValue && groupValue.label) {
            groupItems.push({
              id: groupKey,
              ...groupValue
            })
          }
        }
        if (groupItems.length > 0) {
          result.push({
            id: key,
            isGroup: true,
            items: groupItems,
            label: value.label || key
          })
        }
      } else if (value && value.label) {
        result.push({
          id: key,
          isGroup: false,
          ...value
        })
      }
    }
    return result
  }

  const toolbarItems = parseItems(items)
  const visibleItems = toolbarItems.filter(item => !item.hidden)
  const hiddenItems = toolbarItems.filter(item => item.hidden)
  
  // 主工具栏显示前3个项目，剩下的放在more菜单中
  const mainItems = visibleItems.slice(0, 3)
  const moreItems = visibleItems.slice(3).concat(hiddenItems)

  return (
    <div className="toolbar-container">
      <ButtonGroup className="overflow-x-auto scrollbar-hide">
        {mainItems.map((item, index) => (
          item.isGroup ? (
            <div 
              key={item.id} 
              className="relative"
              onMouseEnter={() => {
                setHoveredItem(item)
                setMouseOverGroup(item.id)
              }}
              onMouseLeave={() => {
                setHoveredItem(null)
                setMouseOverGroup(null)
              }}
            >
              <Button variant="outline" size="icon" className="relative">
                <div className="toolbar-item-icon">📂</div>
                {hoveredItem && hoveredItem.id === item.id && hoveredItem.label && (
                  <div className="toolbar-tooltip">
                    {hoveredItem.label}
                  </div>
                )}
              </Button>
              {mouseOverGroup === item.id && (
                <div 
                  className="toolbar-group-dropdown"
                  onMouseEnter={() => setMouseOverGroup(item.id)}
                  onMouseLeave={() => setMouseOverGroup(null)}
                >
                  {item.items.map((subItem, subIndex) => (
                    <div 
                      key={subItem.id}
                      className="toolbar-group-item"
                      onMouseEnter={() => setHoveredItem(subItem)}
                      onMouseLeave={() => setHoveredItem(item)}
                    >
                      <div className="toolbar-item-icon">
                        {subItem.icon ? (
                          <div dangerouslySetInnerHTML={{ __html: subItem.icon }} />
                        ) : (
                          '📝'
                        )}
                      </div>
                      {hoveredItem && hoveredItem.id === subItem.id && hoveredItem.label && (
                        <div className="toolbar-tooltip toolbar-tooltip-sub">
                          {hoveredItem.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div 
              key={item.id} 
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Button variant="outline" size="icon" className="relative">
                <div className="toolbar-item-icon">
                  {item.icon ? (
                    <div dangerouslySetInnerHTML={{ __html: item.icon }} />
                  ) : (
                    '📝'
                  )}
                </div>
                {hoveredItem && hoveredItem.id === item.id && hoveredItem.label && (
                  <div className="toolbar-tooltip">
                    {hoveredItem.label}
                  </div>
                )}
              </Button>
            </div>
          )
        ))}
        {moreItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More Options">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {moreItems.map((item, index) => (
                item.isGroup ? (
                  <div key={item.id}>
                    <DropdownMenuItem>
                      <div className="flex items-center gap-2">
                        <div>📂</div>
                        <span>{item.label}</span>
                      </div>
                    </DropdownMenuItem>
                    {item.items.map((subItem, subIndex) => (
                      <DropdownMenuItem key={subItem.id} className="pl-8">
                        <div className="flex items-center gap-2">
                          {subItem.icon ? (
                            <div dangerouslySetInnerHTML={{ __html: subItem.icon }} />
                          ) : (
                            '📝'
                          )}
                          <span>{subItem.label}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <DropdownMenuItem key={item.id}>
                    <div className="flex items-center gap-2">
                      {item.icon ? (
                        <div dangerouslySetInnerHTML={{ __html: item.icon }} />
                      ) : (
                        '📝'
                      )}
                      <span>{item.label}</span>
                    </div>
                  </DropdownMenuItem>
                )
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </ButtonGroup>
    </div>
  )
}

export default Toolbar
