/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logger 统一接口
 * 已迁移到 /src/lib/logger，此处保留兼容性
 * DEPRECATED: 使用 /src/lib/logger 代替
 */

// 从新位置重新导出，保持兼容性
export { default as logger, default } from '../lib/logger/index';
export { getLogger, updateLoggerConfig, resetLogger } from '../lib/logger/index';
export type { Logger, PluginLogLevel, LoggerOptions } from '../lib/logger/types';

import { logger as defaultLogger } from './logger';

import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';

// 递归代理模块（同步方法保持同步！异步才打印日志）
function createLoggerModuleProxy<T extends object>(
    module: T,
    moduleName: string,
    logger = defaultLogger
): T {
    return new Proxy(module, {
        get(target, prop) {
            const propName = String(prop)
            const value = Reflect.get(target, prop)
            const fullMethod = `logseq.${moduleName}.${propName}`

            // 如果是函数 → 判断是否为异步函数
            if (typeof value === 'function') {
                // 同步方法 → 不包装 async！！！
                if (value.constructor.name !== 'AsyncFunction') {
                    return (...args: any[]) => {
                        logger.debug(`📤 [同步调用] → ${fullMethod}`, ...args);
                        const result = value.apply(target, args);
                        logger.debug(`📤 [同步返回] ← ${fullMethod}`, result);
                        return result;
                    };
                }

                // 异步方法：打印入参 + 返回值 + 捕获异常
                return async (...args: any[]) => {
                    logger.debug(`⏳ [异步调用] → ${fullMethod}`, ...args);
                    try {
                        const result = await value.apply(target, args);
                        logger.debug(`⏳ [异步返回] ← ${fullMethod}`, result);
                        return result;
                    } catch (err) {
                        logger.error(`❌ [调用异常] × ${fullMethod}`, err);
                        throw err;
                    }
                };
            }

            // 对象递归代理
            if (typeof value === 'object' && value !== null && value !== target) {
                return createLoggerModuleProxy(value, `${moduleName}.${propName}`, logger)
            }

            return value
        },
    })
}

/**
 * 安全版 LoggerProxy（不会炸 React ！）
 */
export function createLoggerProxy(
    rawLogseq: ILSPluginUser,
    logger = defaultLogger
): ILSPluginUser {
    // const logseq = { ...rawLogseq } as ILSPluginUser

    // const LOGSEQ_MODULES = [
    //     'App', 'Editor', 'DB', 'Git', 'UI', 'Assets', 'FileStorage'
    // ] as const

    // for (const mod of LOGSEQ_MODULES) {
    //     if (logseq[mod]) {
    //         (logseq as any)[mod] = createLoggerModuleProxy(logseq[mod], mod, logger)
    //     }
    // }

    // return logseq

    return createLoggerModuleProxy(rawLogseq, '', logger);
}