/**
 * @jest-environment jsdom
 *
 * audio-util.test.ts
 *
 * Unit tests for utils/audio.ts — playSuccessSound()
 * Covers: Web Audio API mock, error handling, no-op on missing API
 *
 * Framework: Jest + React Testing Library (jsdom)
 * Rules:
 *  - Mock Web Audio API (AudioContext, OscillatorNode, GainNode)
 *  - No real audio playback in test env
 *  - TypeScript strict — no `any` in test code
 */

import { playSuccessSound } from "@/utils/audio";

// ─── Type helpers for mocks ───────────────────────────────────────────────────

interface MockGainNode {
  gain: {
    setValueAtTime: jest.Mock;
    linearRampToValueAtTime: jest.Mock;
    exponentialRampToValueAtTime: jest.Mock;
  };
  connect: jest.Mock;
}

interface MockOscillatorNode {
  type: string;
  frequency: { setValueAtTime: jest.Mock };
  connect: jest.Mock;
  start: jest.Mock;
  stop: jest.Mock;
}

interface MockAudioContext {
  currentTime: number;
  createOscillator: jest.Mock;
  createGain: jest.Mock;
  destination: Record<string, never>;
}

// ─── Factory: create a fresh mock AudioContext for each test ─────────────────

function makeMockAudioContext(): MockAudioContext {
  const mockGainNode: MockGainNode = {
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  };

  const mockOscillator: MockOscillatorNode = {
    type: "sine",
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  };

  return {
    currentTime: 0,
    createOscillator: jest.fn().mockReturnValue(mockOscillator),
    createGain: jest.fn().mockReturnValue(mockGainNode),
    destination: {},
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("playSuccessSound — AudioContext creation", () => {
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    mockCtx = makeMockAudioContext();
    window.AudioContext = jest
      .fn()
      .mockImplementation(() => mockCtx) as unknown as typeof AudioContext;
    delete (window as { webkitAudioContext?: unknown }).webkitAudioContext;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates an AudioContext when called", () => {
    playSuccessSound();
    expect(window.AudioContext).toHaveBeenCalledTimes(1);
  });

  it("creates exactly 2 oscillators (one per note)", () => {
    playSuccessSound();
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("creates exactly 2 gain nodes (one per note)", () => {
    playSuccessSound();
    expect(mockCtx.createGain).toHaveBeenCalledTimes(2);
  });

  it("sets oscillator type to 'sine'", () => {
    playSuccessSound();
    const firstOscillator = mockCtx.createOscillator.mock.results[0]
      .value as MockOscillatorNode;
    expect(firstOscillator.type).toBe("sine");
  });

  it("starts all oscillators", () => {
    playSuccessSound();
    for (const call of mockCtx.createOscillator.mock.results) {
      const osc = call.value as MockOscillatorNode;
      expect(osc.start).toHaveBeenCalledTimes(1);
    }
  });

  it("stops all oscillators", () => {
    playSuccessSound();
    for (const call of mockCtx.createOscillator.mock.results) {
      const osc = call.value as MockOscillatorNode;
      expect(osc.stop).toHaveBeenCalledTimes(1);
    }
  });

  it("connects each oscillator to its gain node", () => {
    playSuccessSound();
    const oscillators = mockCtx.createOscillator.mock.results.map(
      (r) => r.value as MockOscillatorNode
    );
    const gainNodes = mockCtx.createGain.mock.results.map(
      (r) => r.value as MockGainNode
    );

    oscillators.forEach((osc, i) => {
      expect(osc.connect).toHaveBeenCalledWith(gainNodes[i]);
    });
  });

  it("connects each gain node to the audio destination", () => {
    playSuccessSound();
    const gainNodes = mockCtx.createGain.mock.results.map(
      (r) => r.value as MockGainNode
    );
    gainNodes.forEach((gain) => {
      expect(gain.connect).toHaveBeenCalledWith(mockCtx.destination);
    });
  });
});

describe("playSuccessSound — WebkitAudioContext fallback", () => {
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    mockCtx = makeMockAudioContext();
    // Remove standard AudioContext, expose webkit version
    delete (window as { AudioContext?: unknown }).AudioContext;
    (window as { webkitAudioContext?: unknown }).webkitAudioContext = jest
      .fn()
      .mockImplementation(() => mockCtx);
  });

  afterEach(() => {
    delete (window as { webkitAudioContext?: unknown }).webkitAudioContext;
    jest.restoreAllMocks();
  });

  it("falls back to webkitAudioContext when AudioContext is unavailable", () => {
    // Should not throw — uses webkit fallback
    expect(() => playSuccessSound()).not.toThrow();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });
});

describe("playSuccessSound — No-op when AudioContext is unavailable", () => {
  beforeEach(() => {
    // Remove both AudioContext variants to simulate unsupported environment
    delete (window as { AudioContext?: unknown }).AudioContext;
    delete (window as { webkitAudioContext?: unknown }).webkitAudioContext;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not throw when neither AudioContext nor webkitAudioContext exists", () => {
    expect(() => playSuccessSound()).not.toThrow();
  });
});

describe("playSuccessSound — Error handling", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("logs an error and does not crash when AudioContext constructor throws", () => {
    window.AudioContext = jest.fn().mockImplementation(() => {
      throw new Error("AudioContext creation failed");
    }) as unknown as typeof AudioContext;

    expect(() => playSuccessSound()).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Audio playback failed",
      expect.any(Error)
    );
  });
});
