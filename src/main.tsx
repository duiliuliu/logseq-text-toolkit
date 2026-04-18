import '@logseq/libs'

// 基础插件初始化
const main = async () => {
  try {
    console.log('Initializing Text Toolkit Plugin')
    
    // 注册工具栏按钮
    logseq.App.registerUIItem('toolbar', {
      key: 'text-toolkit-btn',
      template: `
        <button style="font-weight: bold; background: none; border: none; cursor: pointer; font-size: 16px;" data-on-click="showHello" data-rect>
          ⚙️
        </button>
      `,
    })
    
    // 提供模型方法
    logseq.provideModel({
      showHello: () => {
        logseq.UI.showMsg('Hello from Text Toolkit!', 'info')
      }
    })
    
    console.log('Text Toolkit Plugin initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Text Toolkit Plugin:', error)
  }
}

// 启动插件
logseq.ready(main).catch(console.error)
