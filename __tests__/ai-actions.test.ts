/**
 * ai-actions.test.ts
 *
 * Unit tests for app/actions/ai.actions.ts
 */

import { generateTaskBreakdown } from "@/app/actions/ai.actions";

describe("ai.actions", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns a deterministic list of subtasks after the simulated delay", async () => {
    const promise = generateTaskBreakdown("My Task", "desc");

    // Not resolved yet
    jest.advanceTimersByTime(1999);

    // Finish delay
    jest.advanceTimersByTime(1);

    const res = await promise;

    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThanOrEqual(3);
    expect(res[0]).toContain("My Task");
  });
});
