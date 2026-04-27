/**
 * 执行器注册器
 */

import { actionExecutor } from './ActionExecutor.ts';
import { commentExecutor, inlineCommentExecutor } from './executors/CommentExecutor.ts';
import { replaceExecutor, regexReplaceExecutor } from './executors/TextProcessorExecutor.ts';
import { externalPluginExecutor } from './executors/ExternalPluginExecutor.ts';

/**
 * 注册所有执行器
 */
export const registerExecutors = (): void => {
  // 注册评论执行器
  actionExecutor.registerExecutor('comment', commentExecutor);
  actionExecutor.registerExecutor('inlineComment', commentExecutor);
  actionExecutor.registerExecutor('invokeInlineComment', inlineCommentExecutor);
  
  // 注册文本处理执行器
  actionExecutor.registerExecutor('replace', replaceExecutor);
  actionExecutor.registerExecutor('regexReplace', regexReplaceExecutor);
  
  // 注册外部插件执行器
  actionExecutor.registerExecutor('invokeExternalPlugin', externalPluginExecutor);
};
