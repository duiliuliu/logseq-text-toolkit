import React, { useState, useEffect } from 'react';
import { hut } from 'react-hut';
import './styles.css';

interface HiccupRendererProps {
  initialContent?: string;
}

function HiccupRenderer({ initialContent = '[:p "Hello, Hiccup!"]' }: HiccupRendererProps) {
  const [hiccupContent, setHiccupContent] = useState(initialContent);
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    // 实时渲染 hiccup 内容
    try {
      const parsed = eval(hiccupContent);
      const element = hut(parsed);
      setRenderedContent(element);
    } catch (error) {
      setRenderedContent(<span style={{ color: 'red' }}>Invalid hiccup: {error.message}</span>);
    }
  }, [hiccupContent]);

  // 初始渲染
  useEffect(() => {
    try {
      const parsed = eval(initialContent);
      const element = hut(parsed);
      setRenderedContent(element);
    } catch (error) {
      setRenderedContent(<span style={{ color: 'red' }}>Invalid hiccup: {error.message}</span>);
    }
  }, []);

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