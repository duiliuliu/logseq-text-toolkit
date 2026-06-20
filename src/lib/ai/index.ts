/**
 * 🤖 AI 摘要增强 - 对外暴露的入口
 *
 * 用法示例:
 *   const service = await AIService.fromSettings();
 *   if (service.isEnabled()) {
 *     const insights = await service.generateSummaryInsights(textInput);
 *   }
 */

export { AIService } from './AIService';
export * from './types';
