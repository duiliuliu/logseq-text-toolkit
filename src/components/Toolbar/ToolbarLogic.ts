import { ToolbarItem, ToolbarGroup } from './types.ts';
import { processSelectedData, SelectedData } from '../../utils/textProcessor.ts';

export type IconName = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'highlighter' | 'type' | 'x' | 'menu';

export interface ToolbarLogicProps {
  items: Record<string, any>;
  selectedData?: SelectedData;
  onTextProcessed?: (processedText: string) => void;
}

/**
 * 解析工具栏项目
 */
export const parseItems = (data: Record<string, any>): (ToolbarItem | ToolbarGroup)[] => {
  const result: (ToolbarItem | ToolbarGroup)[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value.isGroup) {
      const groupItems: Record<string, ToolbarItem> = {};
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
          };
        }
      }
      if (Object.keys(groupItems).length > 0) {
        result.push({
          id: key,
          isGroup: true as const,
          items: groupItems,
          label: value.label || key,
          hidden: value.hidden || false
        });
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
      });
    }
  }
  return result;
};

/**
 * 处理工具栏项目点击
 */
export const handleItemClick = async (item: ToolbarItem, selectedData: SelectedData, onTextProcessed?: (processedText: string) => void) => {
  if (item.clickfunc && selectedData.text) {
    const processedText = await processSelectedData(item, selectedData);
    if (onTextProcessed) {
      onTextProcessed(processedText);
    }
  }
};

/**
 * 过滤工具栏项目
 */
export const filterToolbarItems = (items: (ToolbarItem | ToolbarGroup)[]) => {
  // 区分可见元素和隐藏元素
  const visibleItems = items.filter(item => !item.hidden);
  const hiddenItems = items.filter(item => item.hidden);
  
  // 所有可见元素都直接展示，不需要截取前3个
  const mainItems = visibleItems;
  
  // 只有隐藏元素需要折叠到more中
  const moreItems = hiddenItems;
  
  // 只有当有隐藏元素时才需要展示more按钮
  const hasMoreItems = moreItems.length > 0;
  
  return { visibleItems, hiddenItems, mainItems, moreItems, hasMoreItems };
};