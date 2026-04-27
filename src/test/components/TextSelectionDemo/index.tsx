import React from 'react';
import HiccupRenderer from '../HiccupRenderer/index.tsx';

const TextSelectionDemo: React.FC = () => {
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
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">产品功能枚举</h3>
          <p className="demo-text">
            插件支持以下核心功能：
          </p>
          <ul className="demo-list">
            <li>文本格式化（加粗、斜体、删除线等）</li>
            <li>多种颜色的背景高亮</li>
            <li>自定义文本颜色</li>
            <li>彩色下划线</li>
            <li>标注功能</li>
            <li>页面和日记评论功能</li>
            <li>支持自定义配置</li>
            <li>支持 light/dark 主题</li>
            <li>支持多语言国际化</li>
          </ul>
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">Hiccup 语法渲染</h3>
          <p className="demo-text">
            插件支持 Hiccup 语法，以下是一些示例：
          </p>
          <HiccupRenderer initialContent='前[:u.red Logseq]  后面
[:span.inline-comment {:data-comment "评论内容"} "带评论的文本"]
[:mark.red "红色高亮"]
[:span.blue "蓝色文本"]
[:sub 下标文本]
[:sup 上标文本]
`代码块`' />
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">代码和列表</h3>
          <div className="demo-code">
            <code>const greeting = "Hello, Logseq!";</code>
          </div>
          <ul className="demo-list">
            <li>项目一：文本格式化</li>
            <li>项目二：颜色高亮</li>
            <li>项目三：代码块</li>
            <li>项目四：列表样式</li>
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
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">Markdown 语法支持</h3>
          <p className="demo-text">
            工具支持标准的 Markdown 语法，包括：
            <code># 一级标题</code>、
            <code>## 二级标题</code>、
            <code>### 三级标题</code>、
            <code>- 无序列表</code>、
            <code>1. 有序列表</code>、
            <code>```代码块```</code> 等。
          </p>
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">实际应用场景</h3>
          <p className="demo-text">
            在实际使用中，您可以：
          </p>
          <ul className="demo-list">
            <li>快速格式化笔记内容</li>
            <li>创建清晰的文档结构</li>
            <li>突出显示重要信息</li>
            <li>添加代码示例和技术说明</li>
            <li>组织任务清单和项目计划</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextSelectionDemo;