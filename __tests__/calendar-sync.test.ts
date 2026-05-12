/**
 * @jest-environment node
 *
 * calendar-sync.test.ts
 *
 * Tests that createEvent / updateEvent / deleteEvent in lib/googleCalendar.ts:
 *   1. Call the Google Calendar API with a correctly formatted payload.
 *   2. Propagate API errors correctly.
 *   3. Calculate end-time from duration accurately.
 *
 * The actual fetch() call is mocked via jest.spyOn so no real HTTP request is made.
 */

import { createEvent, updateEvent, deleteEvent } from '@/lib/googleCalendar';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal mock Response object. */
function mockResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  fetchSpy = jest.spyOn(global, 'fetch');
});

afterEach(() => {
  fetchSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// createEvent
// ---------------------------------------------------------------------------

describe('createEvent', () => {
  const ACCESS_TOKEN = 'test-access-token';

  it('sends a POST request to the correct Google Calendar endpoint', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ id: 'event-001' }));

    const startDate = new Date('2026-05-05T10:00:00.000Z');
    const endDate = new Date('2026-05-05T11:00:00.000Z');

    await createEvent(ACCESS_TOKEN, {
      summary: 'Study Session',
      description: 'Chapter 3 review',
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];

    expect(url).toBe('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    });
  });

  it('encodes start and end times as valid ISO-8601 strings in the request body', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ id: 'event-002' }));

    const durationMinutes = 90;
    const startDate = new Date('2026-05-06T08:00:00.000Z');
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    await createEvent(ACCESS_TOKEN, {
      summary: 'Exam Prep',
      description: '',
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string);

    // ISO-8601 pattern: YYYY-MM-DDTHH:mm:ss.sssZ
    expect(body.start.dateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(body.end.dateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

    // End should be exactly 90 minutes after start
    const parsedStart = new Date(body.start.dateTime).getTime();
    const parsedEnd = new Date(body.end.dateTime).getTime();
    expect(parsedEnd - parsedStart).toBe(durationMinutes * 60 * 1000);
  });

  it('returns the event object (including id) from the API response', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ id: 'gCal-abc-123', status: 'confirmed' }));

    const result = await createEvent(ACCESS_TOKEN, {
      summary: 'Mock Task',
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date().toISOString() },
    });

    expect(result.id).toBe('gCal-abc-123');
  });

  it('throws an error when the Google API returns a non-OK response', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockResponse({ error: { message: 'Invalid credentials' } }, false, 401)
    );

    await expect(
      createEvent(ACCESS_TOKEN, {
        summary: 'Fail Task',
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date().toISOString() },
      })
    ).rejects.toThrow('Google API Error: Invalid credentials');
  });
});

// ---------------------------------------------------------------------------
// updateEvent
// ---------------------------------------------------------------------------

describe('updateEvent', () => {
  const ACCESS_TOKEN = 'test-access-token';
  const EVENT_ID = 'existing-event-id-456';

  it('sends a PATCH request to the correct endpoint including the event ID', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ id: EVENT_ID }));

    await updateEvent(ACCESS_TOKEN, EVENT_ID, {
      summary: 'Updated Task Title',
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date().toISOString() },
    });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];

    expect(url).toBe(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${EVENT_ID}`
    );
    expect(init.method).toBe('PATCH');
  });

  it('sends the updated payload in the request body', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ id: EVENT_ID }));

    const updatedSummary = 'Revised Lecture Notes';
    const newStart = new Date('2026-05-07T09:00:00.000Z').toISOString();
    const newEnd = new Date('2026-05-07T10:30:00.000Z').toISOString();

    await updateEvent(ACCESS_TOKEN, EVENT_ID, {
      summary: updatedSummary,
      start: { dateTime: newStart },
      end: { dateTime: newEnd },
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string);
    expect(body.summary).toBe(updatedSummary);
    expect(body.start.dateTime).toBe(newStart);
    expect(body.end.dateTime).toBe(newEnd);
  });

  it('throws an error when update fails on the API side', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockResponse({ error: { message: 'Event not found' } }, false, 404)
    );

    await expect(
      updateEvent(ACCESS_TOKEN, EVENT_ID, { summary: 'Oops' })
    ).rejects.toThrow('Google API Error: Event not found');
  });
});

// ---------------------------------------------------------------------------
// deleteEvent
// ---------------------------------------------------------------------------

describe('deleteEvent', () => {
  const ACCESS_TOKEN = 'test-access-token';
  const EVENT_ID = 'event-to-delete-789';

  it('sends a DELETE request to the correct endpoint', async () => {
    // Google Calendar DELETE returns 204 No Content — body is empty, ok = true
    fetchSpy.mockResolvedValueOnce(mockResponse(null, true, 204));

    await deleteEvent(ACCESS_TOKEN, EVENT_ID);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];

    expect(url).toBe(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${EVENT_ID}`
    );
    expect(init.method).toBe('DELETE');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      `Bearer ${ACCESS_TOKEN}`
    );
  });

  it('returns true on a successful deletion', async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(null, true, 204));

    const result = await deleteEvent(ACCESS_TOKEN, EVENT_ID);

    expect(result).toBe(true);
  });

  it('throws an error when the API returns a failure status', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockResponse({ error: { message: 'Insufficient permissions' } }, false, 403)
    );

    await expect(deleteEvent(ACCESS_TOKEN, EVENT_ID)).rejects.toThrow(
      'Google API Error: Insufficient permissions'
    );
  });
});
