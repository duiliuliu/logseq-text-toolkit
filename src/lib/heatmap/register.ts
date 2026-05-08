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

const MACRO_PREFIX = ':热力图';
const PLUGIN_ID = 'text-toolkit-heatmap';

let HeatmapComponent: React.FC<any> | null = null;

export function setHeatmapComponent(component: React.FC<any>) {
  HeatmapComponent = component;
}

async function parseMacroArguments(args: string[]): Promise<{
  viewType: HeatmapViewType;
  queryType: 'tag' | 'page' | 'property';
  queryValue: string;
  propertyKey?: string;
  displayMode: DisplayMode;
  colorFormula: ColorFormula;
  referenceYear?: number;
  referenceMonth?: number;
  referenceWeek?: number;
}> {
  let viewType: HeatmapViewType = 'year';
  let queryType: 'tag' | 'page' | 'property' = 'tag';
  let queryValue = '';
  let propertyKey = '';
  let displayMode: DisplayMode = 'full';
  let colorFormula: ColorFormula = 'simple';
  let referenceYear: number | undefined;
  let referenceMonth: number | undefined;
  let referenceWeek: number | undefined;

  for (const arg of args) {
    const trimmed = arg.trim();

    if (VIEW_TYPE_MAP[trimmed]) {
      viewType = VIEW_TYPE_MAP[trimmed];
    } else if (DISPLAY_MODE_MAP[trimmed]) {
      displayMode = DISPLAY_MODE_MAP[trimmed];
    } else if (COLOR_FORMULA_MAP[trimmed]) {
      colorFormula = COLOR_FORMULA_MAP[trimmed];
    } else if (trimmed.startsWith(':tag=')) {
      queryType = 'tag';
      queryValue = trimmed.substring(5);
    } else if (trimmed.startsWith(':page=')) {
      queryType = 'page';
      queryValue = trimmed.substring(6);
    } else if (trimmed.startsWith(':property=')) {
      queryType = 'property';
      const propertyStr = trimmed.substring(10);
      const [key, value] = propertyStr.split('::');
      propertyKey = key;
      queryValue = value;
    } else if (trimmed.startsWith(':year=')) {
      const yearStr = trimmed.substring(6);
      const year = parseInt(yearStr, 10);
      if (!isNaN(year) && year >= 1900 && year <= 2100) {
        referenceYear = year;
      }
    } else if (trimmed.startsWith(':month=')) {
      const monthStr = trimmed.substring(7);
      const month = parseInt(monthStr, 10);
      if (!isNaN(month) && month >= 1 && month <= 12) {
        referenceMonth = month;
      }
    } else if (trimmed.startsWith(':week=')) {
      const weekStr = trimmed.substring(6);
      const week = parseInt(weekStr, 10);
      if (!isNaN(week) && week >= 1 && week <= 52) {
        referenceWeek = week;
      }
    }
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
  };
}

function getDateOfWeek(week: number, year: number): Date {
  const d = new Date(year, 0, 1);
  const dayOfWeek = d.getDay();
  const diff = d.getTimezoneOffset() * 60000;
  const oneWeek = 604800000;
  return new Date(d.getTime() - diff + (week - 1) * oneWeek);
}

async function renderHeatmap(slot: string, args: string[]): Promise<boolean> {
  try {
    const { 
      viewType, 
      queryType, 
      queryValue, 
      propertyKey,
      displayMode, 
      colorFormula, 
      referenceYear, 
      referenceMonth, 
      referenceWeek 
    } = await parseMacroArguments(args);
    
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
    const [type, ...args] = payload.arguments || [];

    if (!type || !type.startsWith(MACRO_PREFIX)) {
      return;
    }

    await renderHeatmap(slot, args);
  });

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Heatmap',
    async () => {
      await logseqAPI.Editor.insertAtEditingCursor(
        `{{renderer ${MACRO_PREFIX} :年度视图 :tag=工作}}`
      );
    }
  );

  logger.info('[Heatmap] Registered successfully');
}