/**
 * @jest-environment jsdom
 *
 * dynamic-greeting.test.tsx
 *
 * Component tests for components/dashboard/DynamicGreeting.tsx
 * Covers Walkthrough Item #3 — Gen-Z UX: Dynamic Greeting
 *
 * Framework: Jest + React Testing Library
 * Rules:
 *  - Mocked external deps (none here, but Date is mocked)
 *  - Focus on user-visible outcomes, not implementation details
 *  - TypeScript strict, no `any`
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import DynamicGreeting from '@/components/dashboard/DynamicGreeting';

// ─── Helper: override Date.prototype.getHours to simulate a specific hour ────
function mockHour(hour: number): jest.SpyInstance {
  return jest.spyOn(Date.prototype, 'getHours').mockReturnValue(hour);
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(Math, 'random').mockRestore?.();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DynamicGreeting — Time-Based Greeting (streak < 5)', () => {
  const name = 'Budi';

  it('shows morning greeting when hour is between 5 and 10', () => {
    mockHour(8);
    // Ensure streak greeting path is not taken
    jest.spyOn(Math, 'random').mockReturnValue(0); // 0 < 0.5, skip streak path

    render(<DynamicGreeting name={name} streak={0} />);

    const text = screen.getByText((content) =>
      content.includes('Pagi-pagi') && content.includes(name)
    );
    expect(text).toBeInTheDocument();
  });

  it('shows midday greeting when hour is between 11 and 14', () => {
    mockHour(13);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    render(<DynamicGreeting name={name} streak={0} />);

    const text = screen.getByText((content) =>
      content.includes('Tetap grind') && content.includes(name)
    );
    expect(text).toBeInTheDocument();
  });

  it('shows afternoon greeting when hour is between 15 and 18', () => {
    mockHour(16);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    render(<DynamicGreeting name={name} streak={0} />);

    const text = screen.getByText((content) =>
      content.includes('Sore yang produktif') && content.includes(name)
    );
    expect(text).toBeInTheDocument();
  });

  it('shows evening greeting when hour is between 19 and 22', () => {
    mockHour(21);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    render(<DynamicGreeting name={name} streak={0} />);

    const text = screen.getByText((content) =>
      content.includes('Malam produktif') && content.includes(name)
    );
    expect(text).toBeInTheDocument();
  });

  it('shows midnight greeting when hour is between 23 and 4', () => {
    mockHour(2);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    render(<DynamicGreeting name={name} streak={0} />);

    const text = screen.getByText((content) =>
      content.includes('Midnight oil') && content.includes(name)
    );
    expect(text).toBeInTheDocument();
  });

  it('shows morning greeting at boundary hour 5 exactly', () => {
    mockHour(5);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    render(<DynamicGreeting name={name} streak={0} />);
    const text = screen.getByText((content) => content.includes('Pagi-pagi'));
    expect(text).toBeInTheDocument();
  });

  it('shows midnight greeting at boundary hour 23 exactly', () => {
    mockHour(23);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    render(<DynamicGreeting name={name} streak={0} />);
    const text = screen.getByText((content) => content.includes('Midnight oil'));
    expect(text).toBeInTheDocument();
  });
});

describe('DynamicGreeting — Streak Greeting (streak >= 5)', () => {
  const name = 'Doni';

  it('shows streak greeting when streak >= 5 and Math.random() > 0.5', () => {
    mockHour(10);
    jest.spyOn(Math, 'random').mockReturnValue(0.8); // > 0.5 → take streak path

    render(<DynamicGreeting name={name} streak={7} />);

    const text = screen.getByText((content) =>
      content.includes('Streak') && content.includes('7') && content.includes(name)
    );
    expect(text).toBeInTheDocument();
  });

  it('falls back to time-based greeting when streak >= 5 but Math.random() <= 0.5', () => {
    mockHour(10);
    jest.spyOn(Math, 'random').mockReturnValue(0.3); // <= 0.5 → fall through to time

    render(<DynamicGreeting name={name} streak={5} />);

    // Should render morning greeting instead of streak greeting
    const text = screen.getByText((content) =>
      content.includes('Pagi-pagi') && content.includes(name)
    );
    expect(text).toBeInTheDocument();
  });

  it('does NOT show streak greeting when streak is below 5', () => {
    mockHour(10);
    jest.spyOn(Math, 'random').mockReturnValue(0.9); // high random but streak is 4

    render(<DynamicGreeting name={name} streak={4} />);

    // Should NOT contain 'Streak 4 hari'
    expect(
      screen.queryByText((content) => content.includes('Streak') && content.includes('4'))
    ).toBeNull();
  });

  it('includes the user name in the streak greeting', () => {
    mockHour(12);
    jest.spyOn(Math, 'random').mockReturnValue(1); // definitely > 0.5

    render(<DynamicGreeting name={name} streak={10} />);

    const text = screen.getByText((content) => content.includes(name));
    expect(text).toBeInTheDocument();
  });
});

describe('DynamicGreeting — Renders a <p> element', () => {
  it('renders a paragraph element with the greeting text', () => {
    mockHour(9);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    render(<DynamicGreeting name="Andi" streak={0} />);

    // The component renders a <p> tag
    const paragraph = screen.getByText((content, element) =>
      element?.tagName === 'P' && content.length > 0
    );
    expect(paragraph).toBeInTheDocument();
  });
});
