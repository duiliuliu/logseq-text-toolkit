import React, { useState, useEffect } from 'react';
import { serialize } from '@thi.ng/hiccup';
import './styles.css';

// 简单的 hiccup 解析器
function parseHiccupString(str: string): any {
  // 去除首尾空白
  str = str.trim();
  
  // 检查是否是数组形式
  if (!str.startsWith('[') || !str.endsWith(']')) {
    throw new Error('Hiccup must be an array starting with [ and ending with ]');
  }
  
  // 尝试使用 Function 构造函数来解析，比 eval 更安全一些
  try {
    return new Function(`return ${str}`)();
  } catch (error) {
    throw new Error(`Failed to parse hiccup: ${error.message}`);
  }
}

interface HiccupRendererProps {
  initialContent?: string;
}

function HiccupRenderer({ initialContent = '[:p "Hello, Hiccup!"]' }: HiccupRendererProps) {
  const [hiccupContent, setHiccupContent] = useState(initialContent);
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(null);

  // 解析和渲染 hiccup 内容
  const renderHiccup = (content: string) => {
    try {
      console.log('解析 hiccup 内容:', content);
      // 解析 hiccup 字符串
      const parsed = parseHiccupString(content);
      
      console.log('解析结果:', parsed);
      // 确保解析结果是数组
      if (!Array.isArray(parsed)) {
        throw new Error('Hiccup must be an array');
      }
      
      // 序列化并渲染
      const html = serialize(parsed);
      console.log('序列化结果:', html);
      setRenderedContent(<div dangerouslySetInnerHTML={{ __html: html }} />);
    } catch (error) {
      console.error('Hiccup 解析错误:', error);
      // 改进错误处理，确保即使错误对象没有 message 属性，也能显示有意义的错误信息
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setRenderedContent(
        <div style={{ color: 'red' }}>
          <div>Invalid hiccup: {errorMessage}</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>解析内容: {content}</div>
        </div>
      );
    }
  };

  useEffect(() => {
    renderHiccup(hiccupContent);
  }, [hiccupContent]);

  // 初始渲染
  useEffect(() => {
    renderHiccup(initialContent);
  }, [initialContent]);

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