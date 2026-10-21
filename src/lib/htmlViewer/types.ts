export interface HtmlAssetFile {
  path: string;
  size?: number;
  modifiedTime?: number;
}

export interface HtmlTextAnchor {
  quote: string;
  prefix: string;
  suffix: string;
  start: number;
  end: number;
}

export interface HtmlAnnotation {
  id: string;
  assetPath: string;
  quote: string;
  comment: string;
  anchor: HtmlTextAnchor;
  createdAt: number;
  blockUuid?: string;
  pageName?: string;
}

export interface SelectionSnapshot {
  anchor: HtmlTextAnchor;
  top: number;
  left: number;
}
