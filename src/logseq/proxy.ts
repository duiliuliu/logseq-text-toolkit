import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import { logger } from './logger';

// 代理配置类型
export type Config = {
    apiServer: string
    apiToken: string
}

const LOGSEQ_MODULES = ['App', 'Editor', 'DB', 'Git', 'UI', 'Assets', 'FileStorage'] as const
type LogseqModule = (typeof LOGSEQ_MODULES)[number]

/** 远程调用 logseq api server */
const fetchLogseqApi = async (config: Config, method: string, args?: unknown[]) => {
    const baseUrl = config.apiServer.replace(/\/$/, '')
    const url = `${baseUrl}/api`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiToken}`,
        },
        body: JSON.stringify({ method, args }),
    })

    const contentType = res.headers.get('Content-Type') || ''
    if (contentType.includes('application/json')) {
        return await res.json()
    }
    return res.text()
}

/** 创建单个模块 Proxy */
function createModuleProxy(config: Config, moduleName: LogseqModule) {
    return new Proxy({}, {
        get(_target, propKey) {
            return async (...args: unknown[]) => {
                const method = `logseq.${moduleName}.${propKey.toString()}`
                logger.debug('[ProxyLogseq] call:', method)
                const data = await fetchLogseqApi(config, method, args)
                if (data?.error) {
                    logger.error('[ProxyLogseq] error:', method, data.error)
                }
                return data
            }
        },
    })
}

/**
 * 工厂方法：生成代理版 ILSPluginUser
 * @param rawLogseq 原生 logseqAPI: ILSPluginUser
 * @param settings 插件配置
 * @param config 代理服务配置
 * @returns 代理包装后的 ILSPluginUser
 */
export function createProxyLogseq(
    rawLogseq: ILSPluginUser,
    settings: Record<string, unknown>,
    config: Config
): ILSPluginUser {
    // 基于原生实例做浅拷贝，避免污染原对象
    const proxyLogseq = { ...rawLogseq } as ILSPluginUser & {
        settings?: Record<string, unknown>
        hideMainUI?: () => void
    }

    // 批量挂载各模块代理
    for (const mod of LOGSEQ_MODULES) {
        (proxyLogseq as any)[mod] = createModuleProxy(config, mod)
    }

    // 自定义方法覆盖
    proxyLogseq.hideMainUI = () => {
        alert('Proxy call to logseq.hideMainUI()')
    }

    // 挂载 settings 
    proxyLogseq.settings = settings

    return proxyLogseq as ILSPluginUser
}


/**
const newProxyLogseq = createProxyLogseq(rawLogseq, {}, newConfig)
currentLogseq = newProxyLogseq
 */ 