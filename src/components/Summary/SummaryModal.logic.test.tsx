import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const generateSummary = vi.hoisted(() => vi.fn());

vi.mock('../../settings/useSettings', () => ({
  useSettingsContext: () => ({
    settings: {
      language: 'zh-CN',
      summary: {
        defaultType: 'yearly',
        defaultTemplate: 'gtd-work-review',
        weeklyPageNameTemplate: '',
        monthlyPageNameTemplate: '',
        customPageNameTemplate: '',
        ai: { enabled: false },
      },
    },
  }),
}));

vi.mock('../../lib/summary/register', () => ({
  generateSummary,
}));

import { SummaryModal } from './SummaryModal';

beforeEach(() => {
  generateSummary.mockReset();
});

afterEach(() => {
  cleanup();
});

describe('SummaryModal logic', () => {
  it('yearly 类型应该自动切换为支持年度的极简模板', () => {
    const { container } = render(
      <SummaryModal isOpen={true} onClose={() => {}} />
    );

    const values = Array.from(container.querySelectorAll('.custom-select__value')).map(el => el.textContent);
    expect(values[0]).toContain('年度');
    expect(values[1]).toContain('极简');
  });

  it('生成失败时应该保留弹窗并显示错误', async () => {
    generateSummary.mockResolvedValue(null);
    const onClose = vi.fn();
    render(<SummaryModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: '生成总结' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('生成失败');
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('自定义日期不完整时不应该调用生成', async () => {
    const { container } = render(
      <SummaryModal isOpen={true} onClose={() => {}} />
    );

    fireEvent.click(container.querySelector('.custom-select__control')!);
    fireEvent.click(screen.getByText('自定义'));

    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBe(2);
    fireEvent.change(dateInputs[0], { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: '生成总结' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('日期');
    });
    expect(generateSummary).not.toHaveBeenCalled();
  });

  it('生成成功时应该关闭弹窗', async () => {
    generateSummary.mockResolvedValue('周度总结-2026-W01');
    const onClose = vi.fn();
    render(<SummaryModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: '生成总结' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
