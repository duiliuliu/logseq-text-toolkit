import { TemplateType, SummaryTemplate } from '../types';
import { GTDWorkReviewTemplate } from './gtdWorkReview';
import { MinimalDashboardTemplate } from './minimalDashboard';

export const TemplateRegistry: Record<TemplateType, SummaryTemplate> = {
  'gtd-work-review': new GTDWorkReviewTemplate(),
  'minimal-dashboard': new MinimalDashboardTemplate(),
};

export function getTemplate(type: TemplateType): SummaryTemplate | undefined {
  return TemplateRegistry[type];
}

export function getAllTemplates(): SummaryTemplate[] {
  return Object.values(TemplateRegistry);
}