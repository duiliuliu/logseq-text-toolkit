import { ToolbarItem, ToolbarGroup } from './types.ts';
import { processSelectedData, SelectedData } from './textProcessor.ts';

export type IconName = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'highlighter' | 'type' | 'x' | 'menu';

export interface ToolbarLogicProps {
  items: Record<string, any>;
  selectedData?: SelectedData;
  onTextProcessed?: (processedText: string) => void;
}

/**
 * 解析工具栏项目
 */
export const parseItems = (data: Array<any>): (ToolbarItem | ToolbarGroup)[] => {
  const result: (ToolbarItem | ToolbarGroup)[] = [];
  
  for (const item of data) {
    if (item && typeof item === 'object') {
      // 检查是否为 group 元素：有 subItems 属性且长度大于 0
      if (item.subItems && Array.isArray(item.subItems) && item.subItems.length > 0) {
        // 处理 subItems
        const subItems: ToolbarItem[] = item.subItems.map((subItem: any) => ({
          id: subItem.id,
          label: subItem.label,
          invoke: subItem.invoke || subItem.funcmode || 'replace',
          invokeParams: subItem.invokeParams || subItem.clickfunc || '',
          binding: subItem.binding,
          icon: subItem.icon,
          regex: subItem.regex,
          replacement: subItem.replacement,
          hidden: subItem.hidden || false
        }));
        
        if (subItems.length > 0) {
          result.push({
            id: item.id,
            label: item.label || item.id,
            invoke: item.invoke || item.funcmode || 'replace',
            invokeParams: item.invokeParams || item.clickfunc || '',
            binding: item.binding,
            icon: item.icon,
            regex: item.regex,
            replacement: item.replacement,
            hidden: item.hidden || false,
            subItems: subItems
          });
        }
      } else if ('label' in item) {
        // 处理普通工具栏项目
        result.push({
          id: item.id,
          label: item.label,
          invoke: item.invoke || item.funcmode || 'replace',
          invokeParams: item.invokeParams || item.clickfunc || '',
          binding: item.binding,
          icon: item.icon,
          regex: item.regex,
          replacement: item.replacement,
          hidden: item.hidden || false
        });
      }
    }
  }
  
  return result;
};

/**
 * 处理工具栏项目点击
 */
export const handleItemClick = async (item: ToolbarItem, selectedData: SelectedData, onTextProcessed?: (processedText: string) => void, language: string = 'zh-CN') => {
  if (item.invokeParams && selectedData.text) {
    const processedText = await processSelectedData(item, selectedData, language);
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