import { describe, expect, it } from 'vitest';
import { assetPathFor, assetTypeOf, isHtmlAssetBlock } from './assetBlock';

describe('HTML asset block detection', () => {
  it('应该识别 html/htm 资产块', () => {
    expect(isHtmlAssetBlock({ properties: { 'logseq.property.asset/type': 'html' } })).toBe(true);
    expect(isHtmlAssetBlock({ properties: { ':logseq.property.asset/type': 'htm' } })).toBe(true);
    expect(isHtmlAssetBlock({ properties: { 'logseq.property.asset/type': 'pdf' } })).toBe(false);
  });

  it('应该生成 assets/<uuid>.<type> 路径', () => {
    expect(assetPathFor({
      uuid: 'asset-uuid',
      properties: { 'logseq.property.asset/type': 'html' },
    })).toBe('assets/asset-uuid.html');
    expect(assetPathFor({
      uuid: 'asset-uuid',
      properties: { 'logseq.property.asset/type': 'text/html' },
    })).toBe('assets/asset-uuid.html');
  });

  it('缺少 uuid 时应该返回 null', () => {
    expect(assetPathFor({ properties: { 'logseq.property.asset/type': 'html' } })).toBeNull();
  });

  it('应该读取 format 回退', () => {
    expect(assetTypeOf({ format: 'HTML' })).toBe('html');
  });
});
