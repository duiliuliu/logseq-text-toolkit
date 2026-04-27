import React, { useState, useEffect } from 'react';
import './styles.css';

// HTML 转义，防止 xss & 特殊字符
function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}

/**
 * 增强版 Hiccup 转 HTML
 * 支持：[:span.inline-comment {:data-comment "xxx"} "文本"]
 * 支持：[:u.red]、[:s.del] 删除线、高亮等
 */
function hiccupToHtml(hiccup: any): string {
  // 纯文本直接返回
  if (!Array.isArray(hiccup)) {
    return escapeHtml(String(hiccup ?? ""));
  }

  const [tagDef, attrRaw, ...childNodes] = hiccup;

  // 1. 解析 tag.class 简写
  const [tag, ...classList] = String(tagDef).split(".");
  // 2. 处理属性：兼容 {} 省略、合并class
  let attrs: Record<string, any> = {};
  let children = childNodes;
  if (attrRaw && typeof attrRaw === "object" && !Array.isArray(attrRaw)) {
    attrs = { ...attrRaw };
  } else {
    // 没有属性，第一个就是子元素
    children = [attrRaw, ...childNodes];
  }

  // 合并简写 class + 属性内 class
  if (classList.length) {
    const existClass = attrs.class ?? "";
    attrs.class = [...String(existClass).split(/\s+/).filter(Boolean), ...classList].join(" ");
  }

  // 3. 拼接属性字符串
  const attrStr = Object.entries(attrs)
    .map(([key, val]) => `${key}="${escapeHtml(String(val))}"`)
    .join(" ");

  // 4. 递归渲染子元素
  const innerHtml = children.map(n => hiccupToHtml(n)).join("");

  // 5. 处理自闭合标签(可选)
  const selfClosing = ["br", "hr", "img", "input"].includes(tag);
  if (selfClosing) {
    return `<${tag}${attrStr ? " " + attrStr : ""} />`;
  }

  return `<${tag}${attrStr ? " " + attrStr : ""}>${innerHtml}</${tag}>`;
}

// 解析字符串形式的 hiccup 为数组
function parseHiccupArray(str: string): any {
  // 简单的 hiccup 解析器，使用空格分割并处理嵌套结构
  let result: any[] = [];
  let current = result;
  let stack: any[] = [];
  let token = '';
  let inString = false;
  let stringChar = '';
  let inObject = false;
  let objectDepth = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (inString) {
      token += char;
      if (char === stringChar && str[i-1] !== '\\') {
        inString = false;
        // 去除引号
        current.push(token.substring(1, token.length - 1));
        token = '';
      }
    } else if (inObject) {
      token += char;
      if (char === '{') objectDepth++;
      if (char === '}') {
        objectDepth--;
        if (objectDepth === 0) {
          inObject = false;
          try {
            // 简单的对象解析
            const obj = JSON.parse(token.replace(/'/g, '"'));
            current.push(obj);
          } catch (error) {
            throw new Error(`Failed to parse object: ${token}`);
          }
          token = '';
        }
      }
    } else {
      if (char === '[' || char === ']' || char === ' ' || char === ',') {
        if (token.trim()) {
          if (token === '{') {
            inObject = true;
            objectDepth = 1;
            token = '{';
          } else {
            // 处理普通标签或其他值
            current.push(token);
          }
          token = '';
        }
        
        if (char === '[') {
          // 开始新的数组
          const newArray: any[] = [];
          current.push(newArray);
          stack.push(current);
          current = newArray;
        } else if (char === ']') {
          // 结束当前数组
          if (stack.length === 0) {
            throw new Error('Mismatched brackets');
          }
          current = stack.pop()!;
        }
      } else if (char === '"' || char === "'") {
        // 开始字符串
        inString = true;
        stringChar = char;
        token = char;
      } else {
        token += char;
      }
    }
  }
  
  return result[0];
}

// 简单的 hiccup 解析器
function parseHiccupString(str: string): string {
  // 去除首尾空白
  str = str.trim();
  
  // 检查是否是数组形式
  if (!str.startsWith('[') || !str.endsWith(']')) {
    throw new Error('Hiccup must be an array starting with [ and ending with ]');
  }
  
  // 直接返回字符串形式的 hiccup
  return str;
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
      const hiccupStr = parseHiccupString(content);
      
      // 解析为数组
      const parsed = parseHiccupArray(hiccupStr);
      
      console.log('解析结果:', parsed);
      // 确保解析结果是数组
      if (!Array.isArray(parsed)) {
        throw new Error('Hiccup must be an array');
      }
      
      // 序列化并渲染
      const html = hiccupToHtml(parsed);
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
          <button onClick={() => setHiccupContent('[:span.inline-comment {:data-comment "d da "} "强大"]')}>
            带注释属性
          </button>
          <button onClick={() => setHiccupContent('[:u.red "红色下划线文字"]')}>
            下划线文字
          </button>
          <button onClick={() => setHiccupContent('[:s.del "删除线文字"]')}>
            删除线文字
          </button>
          <button onClick={() => setHiccupContent('[:mark.highlight "高亮文字"]')}>
            高亮文字
          </button>
        </div>
      </div>
    </div>
  );
}

export default HiccupRenderer;