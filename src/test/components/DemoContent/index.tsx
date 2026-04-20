import React from 'react'

const DemoContent: React.FC = () => {
  return (
    <div className="center-content">
      <div className="content-header">
        <h2 className="content-title">文字选择工具栏演示</h2>
        <p className="content-description">选择下方文本，体验完整的文字格式化工具</p>
      </div>
      
      <div className="demo-container">
        <div className="demo-section">
          <h3 className="demo-section-title">基础文本格式化</h3>
          <p className="demo-text">
            Logseq Text Toolkit 是一款强大的文字格式化工具，支持多种格式转换，包括：
            <strong>粗体文字</strong>、<em>斜体文字</em>、<u>下划线文字</u>、
            <del>删除线文字</del>、<mark>高亮文字</mark>等。
            无论您是在记笔记、写文档，还是在进行知识管理，这个工具都能帮助您提高效率。
          </p>
          <p className="demo-text">
            您可以通过简单的点击操作，快速为选中的文本应用各种格式，无需手动输入标记语法，大大提升了编辑效率。
          </p>
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">代码和列表</h3>
          <div className="demo-code">
            <code>const greeting = "Hello, Logseq!";
console.log(greeting);</code>
          </div>
          <ul className="demo-list">
            <li>项目一：文本格式化</li>
            <li>项目二：颜色高亮</li>
            <li>项目三：代码块</li>
            <li>项目四：列表样式</li>
            <li>项目五：快捷键设置</li>
            <li>项目六：自定义模板</li>
          </ul>
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">高级格式化</h3>
          <p className="demo-text">
            此外，还支持 <span className="highlight-yellow">黄色高亮</span>、
            <span className="highlight-red">红色高亮</span>、
            <span className="highlight-blue">蓝色高亮</span> 等多种颜色标记功能，
            让您的笔记更加丰富多彩。
          </p>
          <p className="demo-text">
            您还可以使用 <strong>自定义模板</strong> 功能，为常用的格式化操作创建快捷方式，
            进一步提高编辑效率。
          </p>
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">快捷键支持</h3>
          <p className="demo-text">
            工具支持多种快捷键操作，例如：
          </p>
          <ul className="demo-list">
            <li><kbd>Ctrl+B</kbd> - 粗体</li>
            <li><kbd>Ctrl+I</kbd> - 斜体</li>
            <li><kbd>Ctrl+U</kbd> - 下划线</li>
            <li><kbd>Ctrl+Shift+X</kbd> - 清除格式</li>
          </ul>
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">实际应用示例</h3>
          <p className="demo-text">
            <strong>示例 1：学习笔记</strong><br />
            您可以使用 <span className="highlight-yellow">高亮</span> 标记重要内容，
            使用 <strong>粗体</strong> 强调关键点，
            使用 <em>斜体</em> 表示引用内容。
          </p>
          <p className="demo-text">
            <strong>示例 2：技术文档</strong><br />
            您可以使用代码块展示代码示例，
            使用列表组织步骤，
            使用颜色标记不同类型的信息。
          </p>
        </div>
      </div>
    </div>
  )
}

export default DemoContent