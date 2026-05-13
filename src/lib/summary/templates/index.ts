import { TemplateType, SummaryTemplate } from '../types';
import { GTDWorkReviewTemplate } from './gtdWorkReview';
import { MinimalDashboardTemplate } from './minimalDashboard';
import { BulletJournalTemplate } from './bulletJournal';
import { OKRReviewTemplate } from './okrReview';
import { StudySummaryTemplate } from './studySummary';

export const TemplateRegistry: Record<TemplateType, SummaryTemplate> = {
  'gtd-work-review': new GTDWorkReviewTemplate(),
  'minimal-dashboard': new MinimalDashboardTemplate(),
  'bullet-journal': new BulletJournalTemplate(),
  'okr-review': new OKRReviewTemplate(),
  'study-summary': new StudySummaryTemplate(),
};

export function getTemplate(type: TemplateType): SummaryTemplate | undefined {
  return TemplateRegistry[type];
}

export function getAllTemplates(): SummaryTemplate[] {
  return Object.values(TemplateRegistry);
}
