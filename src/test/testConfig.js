// 测试页面配置数据
export const testConfig = {
  // 左侧面板配置
  leftPanel: {
    title: "测试面板",
    sections: [
      {
        title: "功能测试",
        items: [
          { id: "text-formatting", label: "文本格式化" },
          { id: "color-highlighting", label: "颜色和高亮" },
          { id: "template-variables", label: "模板变量" }
        ]
      },
      {
        title: "设置",
        items: [
          { id: "theme-settings", label: "主题设置" },
          { id: "toolbar-config", label: "工具栏配置" }
        ]
      }
    ]
  },
  // 右侧面板配置
  rightPanel: {
    title: "快捷操作",
    actions: [
      { id: "clear-all", label: "清空内容" },
      { id: "reset-settings", label: "重置设置" },
      { id: "toggle-theme", label: "切换主题" }
    ]
  },
  // 中间内容区域配置
  content: {
    title: "测试内容",
    paragraphs: [
      "这是一个测试段落，您可以选择其中的文字来测试工具栏的功能。",
      "选中这段文字试试加粗、斜体、下划线等格式。",
      "测试高亮功能：选中文字后可以添加黄色、红色或蓝色高亮。",
      "测试颜色设置：可以将文字变成红色或蓝色。",
      "测试 cloze 功能：将选中的文字变成 cloze 形式。",
      "测试清除格式功能：可以清除文字的所有格式。"
    ]
  }
}

export default testConfig
