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
  // 使用递归下降解析法
  let pos = 0;
  
  function skipWhitespace() {
    while (pos < str.length && /\s/.test(str[pos])) {
      pos++;
    }
  }
  
  function parseString(): string {
    const quote = str[pos];
    pos++;
    let result = '';
    while (pos < str.length && str[pos] !== quote) {
      if (str[pos] === '\\' && pos + 1 < str.length) {
        pos++;
        result += str[pos];
      } else {
        result += str[pos];
      }
      pos++;
    }
    pos++; // 跳过结束引号
    return result;
  }
  
  function parseObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    pos++; // 跳过 {
    skipWhitespace();
    
    while (pos < str.length && str[pos] !== '}') {
      skipWhitespace();
      
      // 解析 key
      if (str[pos] === ':') {
        pos++;
        let key = '';
        while (pos < str.length && /[a-zA-Z0-9_-]/.test(str[pos])) {
          key += str[pos];
          pos++;
        }
        
        skipWhitespace();
        
        // 解析 value
        let value: any;
        if (str[pos] === '"' || str[pos] === "'") {
          value = parseString();
        } else if (str[pos] === '{') {
          value = parseObject();
        } else if (str[pos] === '[') {
          value = parseArray();
        } else {
          // 简单值
          let simpleValue = '';
          while (pos < str.length && !/\s|}|]/.test(str[pos])) {
            simpleValue += str[pos];
            pos++;
          }
          value = simpleValue;
        }
        
        obj[key] = value;
      }
      
      skipWhitespace();
    }
    
    pos++; // 跳过 }
    return obj;
  }
  
  function parseArray(): any[] {
    const arr: any[] = [];
    pos++; // 跳过 [
    skipWhitespace();
    
    while (pos < str.length && str[pos] !== ']') {
      skipWhitespace();
      
      if (str[pos] === '"' || str[pos] === "'") {
        arr.push(parseString());
      } else if (str[pos] === '{') {
        arr.push(parseObject());
      } else if (str[pos] === '[') {
        arr.push(parseArray());
      } else {
        // 简单 token
        let token = '';
        while (pos < str.length && !/\s|}|]/.test(str[pos])) {
          token += str[pos];
          pos++;
        }
        if (token.trim()) {
          // 去除可能的冒号前缀
          arr.push(token.replace(/^:/, ''));
        }
      }
      
      skipWhitespace();
    }
    
    pos++; // 跳过 ]
    return arr;
  }
  
  skipWhitespace();
  if (str[pos] !== '[') {
    throw new Error('Hiccup must start with [');
  }
  
  return parseArray();
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

  // 处理混合文本（包含普通文本和 hiccup）
  const processMixedContent = (content: string): string => {
    // 按换行分割
    const lines = content.split('\n');
    
    // 处理每一行
    const processedLines = lines.map(line => {
      // 匹配 hiccup 模式：以 [: 开始，以 ] 结束
      const hiccupRegex = /\[:[^\]]+\]/g;
      
      // 处理匹配到的 hiccup
      const processedLine = line.replace(hiccupRegex, (match) => {
        try {
          // 解析为数组
          const parsed = parseHiccupArray(match);
          
          // 确保解析结果是数组
          if (Array.isArray(parsed)) {
            // 序列化并返回
            return hiccupToHtml(parsed);
          }
          return match;
        } catch (error) {
          console.error('Hiccup 解析错误:', error);
          return match;
        }
      });
      
      return processedLine;
    });
    
    // 重新组合行，保持换行
    return processedLines.join('<br>');
  };

  // 解析和渲染 hiccup 内容
  const renderHiccup = (content: string) => {
    try {
      console.log('解析 hiccup 内容:', content);
      
      // 处理混合文本
      const html = processMixedContent(content);
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
          <button onClick={() => setHiccupContent('前[:u.red "Logseq"]  后面')}>
            混合文本
          </button>
          <button onClick={() => setHiccupContent('第一行\n[:p "第二行"]\n第三行')}>
            多行文本
          </button>
        </div>
      </div>
    </div>
  );
}

export default HiccupRenderer;