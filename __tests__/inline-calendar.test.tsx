/**
 * @jest-environment jsdom
 *
 * inline-calendar.test.tsx
 *
 * Component tests for components/dashboard/InlineCalendar.tsx
 * Covers Walkthrough Item #1 — Google Calendar Integration & Auth Fallback
 *
 * Framework: Jest + React Testing Library
 * Rules:
 *  - Mock fetchCalendarEvents server action (no real API calls)
 *  - Test loading state, error state (auth fallback), empty state, and events display
 *  - TypeScript strict — no `any` in test code
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import InlineCalendar from '@/components/dashboard/InlineCalendar';

// ─── Mock next/navigation (not used in component directly but may be in deps) ─

// ─── Mock lucide-react icons ─────────────────────────────────────────────────
jest.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="icon-calendar">📅</span>,
  Clock: () => <span data-testid="icon-clock">🕐</span>,
  Loader2: () => <span data-testid="icon-loader">⏳</span>,
  Palette: () => <span data-testid="icon-palette">🎨</span>,
}));

// ─── Mock the server action ───────────────────────────────────────────────────
const mockFetchCalendarEvents = jest.fn();
jest.mock('@/app/actions/calendar.actions', () => ({
  fetchCalendarEvents: (...args: unknown[]) => mockFetchCalendarEvents(...args),
}));

// ─── Reset mock between every test to avoid call-count pollution ────────────────
beforeEach(() => {
  mockFetchCalendarEvents.mockClear();
});

// ─── Sample event data ────────────────────────────────────────────────────────
interface CalendarEvent {
  id: string;
  summary: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    summary: 'Kuliah Algoritma',
    start: { dateTime: new Date('2026-06-07T09:00:00').toISOString() },
    end: { dateTime: new Date('2026-06-07T11:00:00').toISOString() },
  },
  {
    id: 'ev-2',
    summary: 'Meeting Kelompok',
    start: { dateTime: new Date('2026-06-07T13:00:00').toISOString() },
    end: { dateTime: new Date('2026-06-07T14:00:00').toISOString() },
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('InlineCalendar — Loading State', () => {
  it('shows a loading spinner before events are fetched', () => {
    // Never resolve to keep loading state
    mockFetchCalendarEvents.mockReturnValue(new Promise(() => {}));

    render(<InlineCalendar />);

    expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
  });

  it('hides the loading spinner after events are fetched successfully', async () => {
    mockFetchCalendarEvents.mockResolvedValue({ success: true, data: [] });

    render(<InlineCalendar />);

    await waitFor(() => {
      expect(screen.queryByTestId('icon-loader')).toBeNull();
    });
  });
});

describe('InlineCalendar — Error State (Auth Fallback)', () => {
  it('shows a generic error message on fetch failure', async () => {
    mockFetchCalendarEvents.mockResolvedValue({
      success: false,
      error: 'Failed to load events',
    });

    render(<InlineCalendar />);

    expect(await screen.findByText('Failed to load events')).toBeInTheDocument();
  });

  it('shows "Reconnect Google" button when error message contains "log in"', async () => {
    mockFetchCalendarEvents.mockResolvedValue({
      success: false,
      error: 'Please log in with Google to access your calendar.',
    });

    render(<InlineCalendar />);

    const reconnectBtn = await screen.findByRole('button', { name: /Reconnect Google/i });
    expect(reconnectBtn).toBeInTheDocument();
  });

  it('does NOT show "Reconnect Google" button for non-auth errors', async () => {
    mockFetchCalendarEvents.mockResolvedValue({
      success: false,
      error: 'Network timeout',
    });

    render(<InlineCalendar />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Reconnect Google/i })).toBeNull();
    });
  });

  it('"Reconnect Google" button is clickable and present in DOM', async () => {
    mockFetchCalendarEvents.mockResolvedValue({
      success: false,
      error: 'Please log in again',
    });

    render(<InlineCalendar />);

    const btn = await screen.findByRole('button', { name: /Reconnect Google/i });
    expect(btn).toBeInTheDocument();

    // Clicking should not throw an error even though navigation is mocked
    expect(() => fireEvent.click(btn)).not.toThrow();
  });
});

describe('InlineCalendar — Empty State', () => {
  it('shows "No events scheduled" message when events array is empty', async () => {
    mockFetchCalendarEvents.mockResolvedValue({ success: true, data: [] });

    render(<InlineCalendar />);

    expect(await screen.findByText(/No events scheduled for today/i)).toBeInTheDocument();
  });
});

describe('InlineCalendar — Events Display', () => {
  beforeEach(() => {
    mockFetchCalendarEvents.mockResolvedValue({
      success: true,
      data: SAMPLE_EVENTS,
    });
  });

  it('renders each event summary', async () => {
    render(<InlineCalendar />);

    expect(await screen.findByText('Kuliah Algoritma')).toBeInTheDocument();
    expect(await screen.findByText('Meeting Kelompok')).toBeInTheDocument();
  });

  it('does NOT show "No events scheduled" when events exist', async () => {
    render(<InlineCalendar />);

    await waitFor(() => {
      expect(screen.queryByText(/No events scheduled/i)).toBeNull();
    });
  });

  it('calls fetchCalendarEvents at least once on mount', async () => {
    render(<InlineCalendar />);

    await waitFor(() => {
      expect(mockFetchCalendarEvents).toHaveBeenCalled();
    });

    const [startArg, endArg] = mockFetchCalendarEvents.mock.calls[0] as [string, string];

    // Both should be valid ISO date strings
    expect(() => new Date(startArg)).not.toThrow();
    expect(() => new Date(endArg)).not.toThrow();

    const start = new Date(startArg);
    const end = new Date(endArg);

    // End should be after start
    expect(end.getTime()).toBeGreaterThan(start.getTime());

    // End time should be near end of day (hours = 23)
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });
});

describe('InlineCalendar — Theme Switcher', () => {
  beforeEach(() => {
    mockFetchCalendarEvents.mockResolvedValue({ success: true, data: [] });
  });

  it('renders the theme select dropdown', async () => {
    render(<InlineCalendar />);

    await waitFor(() => screen.queryByTestId('icon-loader') === null);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('has "minimalist" as the default theme option selected', async () => {
    render(<InlineCalendar />);

    await waitFor(() => screen.queryByTestId('icon-loader') === null);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('minimalist');
  });

  it('allows switching to cyberpunk theme without crashing', async () => {
    render(<InlineCalendar />);

    await waitFor(() => screen.queryByTestId('icon-loader') === null);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'cyberpunk' } });

    const updatedSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(updatedSelect.value).toBe('cyberpunk');
  });

  it('renders all 4 theme options: minimalist, cyberpunk, retro, pastel', async () => {
    render(<InlineCalendar />);

    await waitFor(() => screen.queryByTestId('icon-loader') === null);

    const options = screen.getAllByRole('option') as HTMLOptionElement[];
    const values = options.map((o) => o.value);

    expect(values).toContain('minimalist');
    expect(values).toContain('cyberpunk');
    expect(values).toContain('retro');
    expect(values).toContain('pastel');
  });
});

describe('InlineCalendar — Header', () => {
  it('renders "Today\'s Schedule" as the heading', async () => {
    mockFetchCalendarEvents.mockResolvedValue({ success: true, data: [] });
    render(<InlineCalendar />);

    expect(await screen.findByText(/Today's Schedule/i)).toBeInTheDocument();
  });
});
