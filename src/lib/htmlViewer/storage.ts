import { logseqAPI } from '../../logseq';
import type { HtmlAnnotation } from './types';

const MEMORY_PREFIX = 'ltt-html-annotations:';

function storageKey(assetPath: string): string {
  return `html-viewer/${encodeURIComponent(assetPath)}.json`;
}

function memoryKey(assetPath: string): string {
  return `${MEMORY_PREFIX}${assetPath}`;
}

function parse(raw: any): HtmlAnnotation[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function loadAnnotations(assetPath: string): Promise<HtmlAnnotation[]> {
  const key = storageKey(assetPath);
  try {
    const storage = logseqAPI.FileStorage;
    if (storage) {
      return parse(await storage.getItem(key));
    }
  } catch {
    // Fall back to localStorage for hosts without FileStorage.
  }

  try {
    return parse(localStorage.getItem(memoryKey(assetPath)));
  } catch {
    return [];
  }
}

export async function saveAnnotations(assetPath: string, annotations: HtmlAnnotation[]): Promise<void> {
  const value = JSON.stringify(annotations);
  try {
    const storage = logseqAPI.FileStorage;
    if (storage) {
      await storage.setItem(storageKey(assetPath), value);
      return;
    }
  } catch {
    // Fall through to localStorage.
  }

  try {
    localStorage.setItem(memoryKey(assetPath), value);
  } catch {
    // Last resort: annotations remain in memory for this session.
  }
}
