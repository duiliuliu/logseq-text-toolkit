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

// 扩展Window接口，添加logseq属性
declare interface Window {
  logseq?: any;
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
