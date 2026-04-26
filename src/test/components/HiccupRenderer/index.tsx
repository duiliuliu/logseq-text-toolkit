import React, { useState, useEffect } from 'react';
import './styles.css';

interface HiccupRendererProps {
  initialContent?: string;
}

// 简单的 hiccup 解析器
function parseHiccup(hiccup: string): React.ReactNode {
  try {
    // 尝试解析 hiccup 字符串
    // 使用 JSON.parse 的变体来解析，更安全
    const sanitizedHiccup = hiccup
      .replace(/'/g, '"')
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?=\s*:)/g, '"$1"');
    
    const parsed = JSON.parse(sanitizedHiccup);
    
    if (Array.isArray(parsed)) {
      return renderHiccupNode(parsed);
    }
    return <span>{hiccup}</span>;
  } catch (error) {
    return <span style={{ color: 'red' }}>Invalid hiccup: {error.message}</span>;
  }
}

// 渲染单个 hiccup 节点
function renderHiccupNode(node: any): React.ReactNode {
  if (typeof node === 'string') {
    return node;
  }
  
  if (Array.isArray(node)) {
    const [tag, props, ...children] = node;
    
    // 处理空节点
    if (!tag) {
      return null;
    }
    
    // 处理字符串标签
    if (typeof tag === 'string') {
      // 解析标签和类名
      const [tagName, ...classNames] = tag.split('.');
      const className = classNames.join(' ');
      
      // 合并类名
      const mergedProps = {
        ...(props || {}),
        ...(className ? { className } : {})
      };
      
      return React.createElement(
        tagName,
        mergedProps,
        children.map((child, index) => (
          <React.Fragment key={index}>
            {renderHiccupNode(child)}
          </React.Fragment>
        ))
      );
    }
  }
  
  return null;
}

function HiccupRenderer({ initialContent = '[:p "Hello, Hiccup!"]' }: HiccupRendererProps) {
  const [hiccupContent, setHiccupContent] = useState(initialContent);
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(parseHiccup(initialContent));

  useEffect(() => {
    // 实时渲染 hiccup 内容
    setRenderedContent(parseHiccup(hiccupContent));
  }, [hiccupContent]);

  return (
    <div className="hiccup-renderer">
      <div className="hiccup-input-section">
        <h3>Hiccup 实时渲染</h3>
        <textarea
          value={hiccupContent}
          onChange={(e) => setHiccupContent(e.target.value)}
          placeholder="输入 hiccup 语法，例如: [:p 'Hello']"
          className="hiccup-textarea"
        />
      </div>
      <div className="hiccup-output-section">
        <h4>渲染结果:</h4>
        <div className="hiccup-result">
          {renderedContent}
        </div>
      </div>
      <div className="hiccup-examples">
        <h4>示例:</h4>
        <div className="example-buttons">
          <button onClick={() => setHiccupContent('[:p "Hello, Hiccup!"]')}>
            基础文本
          </button>
          <button onClick={() => setHiccupContent('[:div [:h1 "标题"] [:p "段落"]]')}>
            嵌套元素
          </button>
          <button onClick={() => setHiccupContent('[:span.bold.red "粗体红色文本"]')}>
            带类名
          </button>
        </div>
      </div>
    </div>
  );
}

export default HiccupRenderer;