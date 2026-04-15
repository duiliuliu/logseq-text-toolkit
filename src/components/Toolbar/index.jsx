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
    <div className="flex justify-center py-4">
      <ButtonGroup className="overflow-x-auto scrollbar-hide">
        {mainItems.map((item, index) => (
          item.isGroup ? (
            <div 
              key={item.id} 
              className="relative"
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Button variant="outline" size="icon" className="relative">
                <div className="flex items-center justify-center">📂</div>
              </Button>
              {hoveredItem && hoveredItem.id === item.id && hoveredItem.label && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                  {hoveredItem.label}
                </div>
              )}
            </div>
          ) : (
            <div 
              key={item.id} 
              className="relative"
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Button variant="outline" size="icon">
                <div className="flex items-center justify-center">
                  {item.icon ? (
                    <div dangerouslySetInnerHTML={{ __html: item.icon }} />
                  ) : (
                    '📝'
                  )}
                </div>
              </Button>
              {hoveredItem && hoveredItem.id === item.id && hoveredItem.label && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                  {hoveredItem.label}
                </div>
              )}
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
