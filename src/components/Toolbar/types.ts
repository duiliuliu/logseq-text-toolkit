// Toolbar 项目类型
export interface ToolbarItem {
  id: string;
  label: string;
  binding?: string;
  icon?: string | React.ReactNode;
  funcmode: string;
  clickfunc: string;
  regex?: string;
  replacement?: string;
  hidden?: boolean;
}

// Toolbar 组类型
export interface ToolbarGroup extends ToolbarItem {
  subItems: ToolbarItem[];
}

// Toolbar 配置类型
export interface ToolbarConfig {
  enabled: boolean;
  showBorder: boolean;
  width: string;
  height: string;
  hoverDelay: number;
  sponsorEnabled: boolean;
  items: Array<ToolbarItem | ToolbarGroup>;
}
