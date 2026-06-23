import { BlockEntity, IndigoColorScheme, INDIGO_COLORS } from './types';

export function generateIndigoGradient(minColor: string, maxColor: string, steps: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const color = interpolateColor(minColor, maxColor, ratio);
    colors.push(color);
  }
  return colors;
}

function interpolateColor(color1: string, color2: string, ratio: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function calculateColorValueSimple(blocks: BlockEntity[]): number {
  if (!blocks || blocks.length === 0) return 0;
  return blocks.length;
}

export function calculateColorValueWeighted(blocks: BlockEntity[]): number {
  if (!blocks || blocks.length === 0) return 0;

  const blockCount = blocks.length;
  const childrenScore = blocks.reduce((sum, block) => {
    const childrenCount = getChildrenCount(block);
    return sum + Math.min(childrenCount * 0.3, 3);
  }, 0);
  const contentScore = blocks.reduce((sum, block) => {
    const content = block['block/content'] || block['block/title'] || '';
    return sum + Math.min(content.length / 100, 1);
  }, 0) * 0.1;

  return blockCount + childrenScore + contentScore;
}

function getChildrenCount(block: BlockEntity): number {
  if (block.children && block.children.length > 0) {
    return block.children.length;
  }
  const props = block['block/properties'];
  if (props && typeof props === 'object') {
    return Object.keys(props).length;
  }
  return 0;
}

export function getColorByValue(value: number, maxValue: number, colorScheme?: IndigoColorScheme): string {
  const colors = colorScheme?.colors || INDIGO_COLORS;
  
  if (value <= 0) return colors[0];
  
  const normalizedValue = Math.min(value / maxValue, 1);
  const index = Math.floor(normalizedValue * (colors.length - 1));
  
  return colors[Math.min(index, colors.length - 1)];
}

export function getPercentage(value: number, maxValue: number): number {
  if (maxValue === 0) return 0;
  return Math.round((value / maxValue) * 100);
}

export function generateProgressBar(percentage: number): string {
  const filled = Math.round((percentage / 100) * 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}