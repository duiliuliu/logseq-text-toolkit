// 全局类型声明

// 声明CSS模块
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// 声明JSON模块
declare module '*.json' {
  const content: any;
  export default content;
}

// 声明logseq全局变量
declare const logseq: {
  Editor: {
    getCurrentBlock: () => Promise<any>;
    updateBlock: (blockId: string, content: string) => Promise<boolean>;
    replaceSelectedText: (text: string) => Promise<boolean>;
    getCurrentPage?: () => Promise<any>;
  };
  App: {
    registerCommand: (command: any) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string) => void;
    getUserConfigs: () => Promise<{
      darkMode: boolean;
      preferredLanguage: string;
      [key: string]: any;
    }>;
    registerUIItem: (slot: string, config: any) => void;
  };
  UI: {
    showMsg: (msg: string, opts?: {
      type?: 'info' | 'error' | 'warning' | 'success';
      timeout?: number;
    }) => void;
  };
  ready: () => Promise<void>;
  settings: Record<string, any>;
  updateSettings: (settings: Record<string, any>) => Promise<void>;
  provideModel: (model: Record<string, any>) => void;
  provideUI: (config: any) => void;
};

// 扩展Window接口，添加logseq属性
declare interface Window {
  logseq?: typeof logseq;
}

// 扩展ImportMeta接口，添加env属性
declare interface ImportMeta {
  env: {
    MODE: string;
    [key: string]: any;
  };
}

// 扩展NodeJS接口
declare namespace NodeJS {
  interface Process {
    env: {
      NODE_ENV: string;
      [key: string]: any;
    };
  }
}
