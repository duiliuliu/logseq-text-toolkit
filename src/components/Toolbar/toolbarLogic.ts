import { ToolbarItem, ToolbarGroup } from './types.ts'
import { processSelectedData, SelectedData } from '../../utils/textProcessor.ts'

// 解析工具栏项目
export const parseItems = (data: Record<string, any>): (ToolbarItem | ToolbarGroup)[] => {
  const result: (ToolbarItem | ToolbarGroup)[] = []
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value.isGroup) {
      const groupItems: Record<string, ToolbarItem> = {}
      for (const [groupKey, groupValue] of Object.entries(value.items || {})) {
        if (groupValue && typeof groupValue === 'object' && 'label' in groupValue) {
          const typedGroupValue = groupValue as any;
          groupItems[groupKey] = {
            id: groupKey,
            label: typedGroupValue.label,
            funcmode: typedGroupValue.funcmode || 'replace',
            clickfunc: typedGroupValue.clickfunc || '',
            binding: typedGroupValue.binding,
            icon: typedGroupValue.icon,
            regex: typedGroupValue.regex,
            replacement: typedGroupValue.replacement,
            hidden: typedGroupValue.hidden || false
          }
        }
      }
      if (Object.keys(groupItems).length > 0) {
        result.push({
          id: key,
          isGroup: true as const,
          items: groupItems,
          label: value.label || key,
          hidden: value.hidden || false
        })
      }
    } else if (value && typeof value === 'object' && 'label' in value) {
      const typedValue = value as any;
      result.push({
        id: key,
        label: typedValue.label,
        funcmode: typedValue.funcmode || 'replace',
        clickfunc: typedValue.clickfunc || '',
        binding: typedValue.binding,
        icon: typedValue.icon,
        regex: typedValue.regex,
        replacement: typedValue.replacement,
        hidden: typedValue.hidden || false
      })
    }
  }
  return result
}

// 处理项目点击
export const handleItemClick = async (
  item: ToolbarItem,
  onTextProcessed?: (processedText: string) => void
): Promise<void> => {
  console.log('=== handleItemClick ===');
  console.log('Item:', item);
  
  // 直接从window.getSelection()获取最新的选中文本
  const selection = window.getSelection();
  const currentSelectedText = selection?.toString() || '';
  console.log('Current selected text:', currentSelectedText);
  
  if (item.clickfunc) {
    if (currentSelectedText) {
      // 创建最新的selectedData
      const currentSelectedData: SelectedData = {
        text: currentSelectedText,
        timestamp: new Date().toISOString(),
        range: selection?.getRangeAt(0),
        rect: selection?.getRangeAt(0)?.getBoundingClientRect()
      };
      console.log('Current selected data:', currentSelectedData);
      
      console.log('Processing item with clickfunc:', item.clickfunc);
      const processedText = await processSelectedData(item, currentSelectedData);
      console.log('Processed text:', processedText);
      if (onTextProcessed) {
        onTextProcessed(processedText);
      }
    } else {
      console.log('No selected text');
    }
  } else {
    console.log('No clickfunc for item');
  }
}

// 分割项目为主要项目和更多项目
export const splitToolbarItems = (items: (ToolbarItem | ToolbarGroup)[]) => {
  const visibleItems = items.filter(item => !item.hidden)
  const hiddenItems = items.filter(item => item.hidden)
  const mainItems = visibleItems.slice(0, 3)
  const moreItems = visibleItems.slice(3).concat(hiddenItems)
  const hasMoreItems = moreItems.length > 0
  
  return { mainItems, moreItems, hasMoreItems }
}
