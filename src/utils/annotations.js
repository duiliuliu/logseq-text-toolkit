// src/utils/annotations.js

// 存储注解数据
const annotations = [];

// 添加注解
export const addAnnotation = (text, comment, pageId) => {
  const annotation = {
    id: Date.now().toString(),
    text,
    comment,
    pageId,
    createdAt: new Date().toISOString()
  };
  annotations.push(annotation);
  // 这里需要实现将注解数据保存到 Logseq 页面的逻辑
  return annotation;
};

// 获取页面的注解
export const getAnnotationsByPageId = (pageId) => {
  return annotations.filter(annotation => annotation.pageId === pageId);
};

// 删除注解
export const deleteAnnotation = (annotationId) => {
  const index = annotations.findIndex(annotation => annotation.id === annotationId);
  if (index !== -1) {
    annotations.splice(index, 1);
    // 这里需要实现从 Logseq 页面删除注解数据的逻辑
    return true;
  }
  return false;
};

export default annotations;