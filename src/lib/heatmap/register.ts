import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { fetchHeatmapData } from './query';
import { 
  HeatmapConfig, 
  VIEW_TYPE_MAP, 
  DISPLAY_MODE_MAP, 
  COLOR_FORMULA_MAP,
  HeatmapViewType,
  DisplayMode,
  ColorFormula
} from './types';
import { logseqAPI } from '../../logseq';
import { getSettingsWithSystem } from '../../settings';
import logger from '../logger/index';
import { generateIndigoGradient } from './colorCalculator';
import { registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render';

const MACRO_PREFIX = ':热力图';
const PLUGIN_ID = 'text-toolkit-heatmap';

let HeatmapComponent: React.FC<any> | null = null;

export function setHeatmapComponent(component: React.FC<any>) {
  HeatmapComponent = component;
}

registerRendererArgModel(MACRO_PREFIX, { positional: ['view'] })

function parseMacroArguments(tokens: string[], argMap: Record<string, string>): {
  viewType: HeatmapViewType;
  queryType: 'tag' | 'page' | 'property';
  queryValue: string;
  propertyKey?: string;
  displayMode: DisplayMode;
  colorFormula: ColorFormula;
  referenceYear?: number;
  referenceMonth?: number;
  referenceWeek?: number;
} {
  let viewType: HeatmapViewType = 'year';
  let queryType: 'tag' | 'page' | 'property' = 'tag';
  let queryValue = '';
  let propertyKey = '';
  let displayMode: DisplayMode = 'full';
  let colorFormula: ColorFormula = 'simple';
  let referenceYear: number | undefined;
  let referenceMonth: number | undefined;
  let referenceWeek: number | undefined;

  const applyViewType = (raw: string) => {
    const v = VIEW_TYPE_MAP[raw.trim()] || VIEW_TYPE_MAP[raw.trim().toLowerCase()]
    if (v) viewType = v
  }

  const applyDisplayMode = (raw: string) => {
    const v = DISPLAY_MODE_MAP[raw.trim()] || DISPLAY_MODE_MAP[raw.trim().toLowerCase()]
    if (v) displayMode = v
  }

  const applyColorFormula = (raw: string) => {
    const v = COLOR_FORMULA_MAP[raw.trim()] || COLOR_FORMULA_MAP[raw.trim().toLowerCase()]
    if (v) colorFormula = v
  }

  const tryInt = (raw: string) => {
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : undefined
  }

  const directView = argMap.viewType || argMap.view
  if (directView) applyViewType(directView)

  const directDisplay = argMap.displayMode || argMap.display
  if (directDisplay) applyDisplayMode(directDisplay)

  const directFormula = argMap.colorFormula || argMap.formula
  if (directFormula) applyColorFormula(directFormula)

  if (argMap.tag) {
    queryType = 'tag'
    queryValue = argMap.tag
  } else if (argMap.page) {
    queryType = 'page'
    queryValue = argMap.page
  } else if (argMap.property) {
    queryType = 'property'
    const [k, v] = argMap.property.split('::')
    propertyKey = (k || '').trim()
    queryValue = (v || '').trim()
  }

  if (argMap.year) referenceYear = tryInt(argMap.year)
  if (argMap.month) referenceMonth = tryInt(argMap.month)
  if (argMap.week) referenceWeek = tryInt(argMap.week)

  for (const token of tokens) {
    const t = token.trim()
    if (!t) continue
    if (t.includes('=')) continue

    if (VIEW_TYPE_MAP[t] || VIEW_TYPE_MAP[t.toLowerCase()]) {
      applyViewType(t)
      continue
    }
    if (DISPLAY_MODE_MAP[t] || DISPLAY_MODE_MAP[t.toLowerCase()]) {
      applyDisplayMode(t)
      continue
    }
    if (COLOR_FORMULA_MAP[t] || COLOR_FORMULA_MAP[t.toLowerCase()]) {
      applyColorFormula(t)
      continue
    }
    if (t.startsWith('tag=')) {
      queryType = 'tag'
      queryValue = t.slice(4)
      continue
    }
    if (t.startsWith('page=')) {
      queryType = 'page'
      queryValue = t.slice(5)
      continue
    }
    if (t.startsWith('property=')) {
      queryType = 'property'
      const propertyStr = t.slice(9)
      const [k, v] = propertyStr.split('::')
      propertyKey = (k || '').trim()
      queryValue = (v || '').trim()
      continue
    }
    if (t.startsWith('year=')) referenceYear = tryInt(t.slice(5))
    if (t.startsWith('month=')) referenceMonth = tryInt(t.slice(6))
    if (t.startsWith('week=')) referenceWeek = tryInt(t.slice(5))
  }

  return {
    viewType,
    queryType,
    queryValue,
    propertyKey,
    displayMode,
    colorFormula,
    referenceYear,
    referenceMonth,
    referenceWeek,
  }
}

function getDateOfWeek(week: number, year: number): Date {
  const d = new Date(year, 0, 1);
  const dayOfWeek = d.getDay();
  const diff = d.getTimezoneOffset() * 60000;
  const oneWeek = 604800000;
  return new Date(d.getTime() - diff + (week - 1) * oneWeek);
}

async function renderHeatmap(slot: string, type: string, tokens: string[]): Promise<boolean> {
  try {
    const argMap = parseRendererArgs(type, tokens)
    const {
      viewType,
      queryType,
      queryValue,
      propertyKey,
      displayMode,
      colorFormula,
      referenceYear,
      referenceMonth,
      referenceWeek,
    } = parseMacroArguments(tokens, argMap)
    
    const settings = await getSettingsWithSystem();

    const now = new Date();
    let referenceDate: Date;

    if (viewType === 'week' && referenceWeek) {
      const weekStart = getDateOfWeek(referenceWeek, referenceYear || now.getFullYear());
      referenceDate = weekStart;
    } else {
      referenceDate = new Date(
        referenceYear || now.getFullYear(),
        (referenceMonth !== undefined ? referenceMonth - 1 : now.getMonth()),
        1
      );
    }

    const resolvedTheme: 'light' | 'dark' = settings?.theme === 'dark' ? 'dark' : 'light';

    const heatmapConfig: HeatmapConfig = {
      viewType,
      displayMode,
      colorFormula,
      colorScheme: {
        name: 'indigo',
        colors: generateIndigoGradient(
          settings?.heatmap?.colorScheme?.minColor || '#eef2ff',
          settings?.heatmap?.colorScheme?.maxColor || '#3730a3',
          settings?.heatmap?.colorScheme?.gradientSteps || 5
        ),
      },
      minColor: settings?.heatmap?.colorScheme?.minColor || '#eef2ff',
      maxColor: settings?.heatmap?.colorScheme?.maxColor || '#3730a3',
      language: settings?.language || 'en',
      referenceDate,
    };

    const heatmapData = await fetchHeatmapData({
      type: queryType,
      value: queryValue,
      propertyKey,
      year: referenceYear,
      month: referenceMonth,
      week: referenceWeek,
    }, viewType, colorFormula);

    if (!HeatmapComponent) {
      logger.warn('[Heatmap] Component not registered');
      return false;
    }

    const template = ReactDOMServer.renderToStaticMarkup(
      React.createElement(HeatmapComponent, {
        config: heatmapConfig,
        data: heatmapData,
        theme: resolvedTheme,
      })
    );

    logseqAPI.provideUI({
      key: PLUGIN_ID + '__' + slot,
      slot,
      reset: true,
      template,
    });

    return true;
  } catch (err) {
    logger.error('[Heatmap] Render error:', err);
    return false;
  }
}

export function registerHeatmap(): void {
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const split = splitRendererArgs(payload.arguments)
    const type = split?.type || ''
    const tokens = split?.tokens || []

    if (!type || !type.startsWith(MACRO_PREFIX)) {
      return;
    }

    await renderHeatmap(slot, type, tokens);
  });

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Heatmap',
    async () => {
      await logseqAPI.Editor.insertAtEditingCursor(
        `{{renderer ${MACRO_PREFIX}, view=year, tag=工作}}`
      );
    }
  );

  logger.info('[Heatmap] Registered successfully');
}
