export interface AssetBlockPropsLike {
  uuid?: string;
  content?: string;
  format?: string;
  properties?: Record<string, any>;
}

function property(props: AssetBlockPropsLike, key: string): any {
  const properties = props.properties || {};
  return properties[key] ?? properties[`:${key}`];
}

export function assetTypeOf(props: AssetBlockPropsLike): string {
  const type = property(props, 'logseq.property.asset/type') ?? props.format ?? '';
  return String(type).toLowerCase();
}

export function isHtmlAssetBlock(props: AssetBlockPropsLike): boolean {
  return ['html', 'htm', 'text/html'].includes(assetTypeOf(props));
}

export function assetPathFor(props: AssetBlockPropsLike): string | null {
  if (!isHtmlAssetBlock(props)) return null;
  const uuid = props.uuid || property(props, 'block/uuid');
  if (!uuid) return null;
  const type = assetTypeOf(props) === 'text/html' ? 'html' : assetTypeOf(props);
  return `assets/${uuid}.${type}`;
}
