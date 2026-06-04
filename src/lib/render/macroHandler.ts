import { splitRendererArgs, parseRendererArgs, registerRendererArgModel } from './rendererArgs'

export type MacroHandlerOptions<ConfigType> = {
  macroPrefix: string
  macroPrefixCn?: string
  argModel: { positional?: string[]; named?: string[] }
  getConfigFromSettings: () => Partial<ConfigType>
  mergeConfig: (macroArgs: Record<string, string>, settingsConfig: Partial<ConfigType>) => ConfigType
  render: (slot: string, config: ConfigType, blockUuid?: string) => Promise<boolean>
}

export function createMacroHandler<ConfigType>(options: MacroHandlerOptions<ConfigType>) {
  const { macroPrefix, macroPrefixCn, argModel, render, getConfigFromSettings, mergeConfig } = options

  // 注册参数模型
  registerRendererArgModel(macroPrefix, argModel)
  if (macroPrefixCn) {
    registerRendererArgModel(macroPrefixCn, argModel)
  }

  return async ({ payload, slot }: any) => {
    try {
      const split = splitRendererArgs(payload.arguments)
      if (!split) return

      const { type, tokens } = split

      // 前缀检查
      if (!type || (!type.startsWith(macroPrefix) && (!macroPrefixCn || !type.startsWith(macroPrefixCn)))) {
        return
      }

      // 解析宏参数
      const macroArgs = parseRendererArgs(type, tokens)

      // 读取 settings 配置
      const settingsConfig = getConfigFromSettings()

      // 合并配置：宏命令参数 > settings > 默认值
      const finalConfig = mergeConfig(macroArgs, settingsConfig)

      // 调用渲染
      await render(slot, finalConfig, payload.uuid)
    } catch (err) {
      console.error(`[MacroHandler] ${macroPrefix} render error:`, err)
    }
  }
}
