// Mock Logseq UI API
const UI = {
  // 显示消息
  showMsg: (msg: string, opts?: {
    type?: 'info' | 'success' | 'error' | 'warning';
    timeout?: number;
  }) => {
    console.log('Show message:', msg, opts);
    
    // 使用 Toast 组件显示消息
    const type = opts?.type || 'info';
    const timeout = opts?.timeout || 3000;
    
    // 尝试使用全局的 addToast 函数
    if ((window as any).addToast) {
      (window as any).addToast(msg, type, timeout);
    } else {
      // 如果没有 Toast 组件，创建一个简单的通知
      createSimpleNotification(msg, type, timeout);
    }
  },
  
  // 显示对话框
  showDialog: (config: {
    title: string;
    body: React.ReactNode;
    buttons?: Array<{
      text: string;
      onClick: () => void;
      primary?: boolean;
    }>;
  }) => {
    console.log('Show dialog:', config);
    // 这里可以实现一个简单的对话框
  },
  
  // 显示下拉菜单
  showContextMenu: (config: {
    x: number;
    y: number;
    items: Array<{
      key: string;
      label: string;
      onClick: () => void;
      disabled?: boolean;
    }>;
  }) => {
    console.log('Show context menu:', config);
    // 这里可以实现一个简单的上下文菜单
  },
};

// 创建简单的通知
const createSimpleNotification = (msg: string, type: string, timeout: number) => {
  const notification = document.createElement('div');
  notification.className = `mock-notification mock-notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
  `;
  
  // 设置不同类型的样式
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#4CAF50';
      break;
    case 'error':
      notification.style.backgroundColor = '#F44336';
      break;
    case 'warning':
      notification.style.backgroundColor = '#FF9800';
      break;
    default:
      notification.style.backgroundColor = '#2196F3';
  }
  
  notification.textContent = msg;
  
  document.body.appendChild(notification);
  
  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // 自动移除通知
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      document.body.removeChild(notification);
      document.head.removeChild(style);
    }, 300);
  }, timeout);
};

export default UI;
