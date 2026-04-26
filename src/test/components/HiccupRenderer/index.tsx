import React, { useState, useEffect } from 'react';
import { serialize } from '@thi.ng/hiccup';
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
      console.log('解析 hiccup 内容:', hiccupContent);
      // 尝试解析 hiccup 字符串
      let parsed;
      try {
        parsed = eval(hiccupContent);
      } catch (evalError) {
        console.log('直接 eval 失败:', evalError.message);
        // 如果直接 eval 失败，尝试添加括号
        try {
          parsed = eval(`(${hiccupContent})`);
        } catch (bracketError) {
          console.log('添加括号后 eval 失败:', bracketError.message);
          throw new Error(`Syntax error: ${bracketError.message}`);
        }
      }
      
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
      setRenderedContent(
        <div style={{ color: 'red' }}>
          <div>Invalid hiccup: {error.message}</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>解析内容: {hiccupContent}</div>
        </div>
      );
    }
  }, [hiccupContent]);

  // 初始渲染
  useEffect(() => {
    try {
      console.log('解析初始 hiccup 内容:', initialContent);
      // 尝试解析 hiccup 字符串
      let parsed;
      try {
        parsed = eval(initialContent);
      } catch (evalError) {
        console.log('直接 eval 失败:', evalError.message);
        // 如果直接 eval 失败，尝试添加括号
        try {
          parsed = eval(`(${initialContent})`);
        } catch (bracketError) {
          console.log('添加括号后 eval 失败:', bracketError.message);
          throw new Error(`Syntax error: ${bracketError.message}`);
        }
      }
      
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
      setRenderedContent(
        <div style={{ color: 'red' }}>
          <div>Invalid hiccup: {error.message}</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>解析内容: {initialContent}</div>
        </div>
      );
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