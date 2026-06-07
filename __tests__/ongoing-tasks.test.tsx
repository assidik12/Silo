/**
 * @jest-environment jsdom
 *
 * ongoing-tasks.test.tsx
 *
 * Component tests for components/dashboard/OngoingTasks.tsx
 * Covers Walkthrough Item #2 — Dashboard Layout & Pagination
 *
 * Framework: Jest + React Testing Library
 * Rules:
 *  - Mock external components that are not under test (TaskCard)
 *  - Test user interaction (pagination clicks) not internal state
 *  - TypeScript strict — use Task interface from @/types
 */

/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OngoingTasks from '@/components/dashboard/OngoingTasks';
import { Task } from '@/types';

// ─── Mock TaskCard so we don't need to pull in all its dependencies ───────────
jest.mock('@/components/tasks/TaskCard', () => {
  function MockTaskCard({ task }: { task: Task }) {
    return <div data-testid={`task-card-${task.id}`}>{task.title}</div>;
  }
  return MockTaskCard;
});

// ─── Mock lucide-react icons ─────────────────────────────────────────────────
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="icon-chevron-left">‹</span>,
  ChevronRight: () => <span data-testid="icon-chevron-right">›</span>,
}));

// ─── Factory: build a minimal valid Task object ───────────────────────────────
function makeTask(id: string, title: string): Task {
  return {
    id,
    user_id: 'user-1',
    title,
    description: null,
    module_link: null,
    scheduled_time: new Date().toISOString(),
    duration_estimate_minutes: 60,
    google_event_id: null,
    status: 'pending',
    created_at: new Date().toISOString(),
    sub_tasks: null,
  };
}

// ─── Test Data ────────────────────────────────────────────────────────────────

const FIVE_TASKS: Task[] = [
  makeTask('t1', 'Task Alpha'),
  makeTask('t2', 'Task Beta'),
  makeTask('t3', 'Task Gamma'),
  makeTask('t4', 'Task Delta'),
  makeTask('t5', 'Task Epsilon'),
];

const FOUR_TASKS: Task[] = FIVE_TASKS.slice(0, 4);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OngoingTasks — Empty State', () => {
  it('shows empty-state message when tasks array is empty', () => {
    render(<OngoingTasks tasks={[]} />);

    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    expect(screen.getByText(/No ongoing tasks right now/i)).toBeInTheDocument();
  });

  it('does NOT render pagination controls when tasks array is empty', () => {
    render(<OngoingTasks tasks={[]} />);

    expect(screen.queryByTestId('icon-chevron-left')).toBeNull();
    expect(screen.queryByTestId('icon-chevron-right')).toBeNull();
  });
});

describe('OngoingTasks — Single Page (≤ 4 tasks)', () => {
  it('renders all tasks when there are exactly 4 (one page)', () => {
    render(<OngoingTasks tasks={FOUR_TASKS} />);

    FOUR_TASKS.forEach((task) => {
      expect(screen.getByTestId(`task-card-${task.id}`)).toBeInTheDocument();
    });
  });

  it('does NOT render pagination controls when tasks fit on one page', () => {
    render(<OngoingTasks tasks={FOUR_TASKS} />);

    // Pagination appears only when totalPages > 1
    expect(screen.queryByText('1 / 1')).toBeNull();
    expect(screen.queryByTestId('icon-chevron-left')).toBeNull();
  });
});

describe('OngoingTasks — Pagination (> 4 tasks)', () => {
  it('shows only the first 4 tasks on page 1', () => {
    render(<OngoingTasks tasks={FIVE_TASKS} />);

    // First 4 should be visible
    expect(screen.getByTestId('task-card-t1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-t2')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-t3')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-t4')).toBeInTheDocument();

    // 5th should NOT be visible on page 1
    expect(screen.queryByTestId('task-card-t5')).toBeNull();
  });

  it('renders pagination controls with correct page indicator "1 / 2"', () => {
    render(<OngoingTasks tasks={FIVE_TASKS} />);

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('navigates to page 2 and shows the 5th task when next button is clicked', () => {
    render(<OngoingTasks tasks={FIVE_TASKS} />);

    // Click the ChevronRight (next) button
    // The button wraps ChevronRight icon; we target it by finding the button that is not disabled
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[1]; // second button = next
    fireEvent.click(nextButton);

    expect(screen.getByTestId('task-card-t5')).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('hides task 1-4 when navigating to page 2', () => {
    render(<OngoingTasks tasks={FIVE_TASKS} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // go to page 2

    expect(screen.queryByTestId('task-card-t1')).toBeNull();
    expect(screen.queryByTestId('task-card-t4')).toBeNull();
  });

  it('disables the previous button on page 1', () => {
    render(<OngoingTasks tasks={FIVE_TASKS} />);

    const buttons = screen.getAllByRole('button');
    const prevButton = buttons[0]; // first button = prev
    expect(prevButton).toBeDisabled();
  });

  it('disables the next button on the last page', () => {
    render(<OngoingTasks tasks={FIVE_TASKS} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // navigate to page 2 (last page)

    // Re-query buttons after state update
    const updatedButtons = screen.getAllByRole('button');
    const nextButton = updatedButtons[1];
    expect(nextButton).toBeDisabled();
  });

  it('navigates back to page 1 when previous button is clicked from page 2', () => {
    render(<OngoingTasks tasks={FIVE_TASKS} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // go forward to page 2
    
    const updatedButtons = screen.getAllByRole('button');
    fireEvent.click(updatedButtons[0]); // go back to page 1

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-t1')).toBeInTheDocument();
  });

  it('renders the "Ongoing Tasks" heading', () => {
    render(<OngoingTasks tasks={FIVE_TASKS} />);
    expect(screen.getByRole('heading', { name: /Ongoing Tasks/i })).toBeInTheDocument();
  });
});
