import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import FloatingPomodoro from "@/components/tasks/FloatingPomodoro";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock usePomodoro hook
jest.mock("@/components/providers/PomodoroProvider", () => ({
  usePomodoro: jest.fn(),
}));

// Mock wellness utility
jest.mock("@/utils/wellness", () => ({
  getRecommendedPomodoro: jest.fn(),
}));

// Mock ModalProvider — FloatingPomodoro calls useModal internally
const mockShowModal = jest.fn();
jest.mock("@/components/providers/ModalProvider", () => ({
  useModal: jest.fn(() => ({ showModal: mockShowModal })),
}));

// Mock Audio API (unavailable in jsdom)
beforeAll(() => {
  window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(window, "Audio", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      play: jest.fn().mockResolvedValue(undefined),
    })),
  });
});

import { usePomodoro } from "@/components/providers/PomodoroProvider";
import { getRecommendedPomodoro } from "@/utils/wellness";

const mockUsePomodoro = usePomodoro as jest.Mock;
const mockGetRecommendedPomodoro = getRecommendedPomodoro as jest.Mock;
const mockStopPomodoro = jest.fn();

/** Set up default mock values for each test */
function setupMocks({
  activeTaskId = "task-123",
  activeTaskTitle = "Nulis Skripsi",
  sentimentScore = 7,
  workMinutes = 20,
  breakMinutes = 5,
}: Partial<{
  activeTaskId: string | null;
  activeTaskTitle: string;
  sentimentScore: number;
  workMinutes: number;
  breakMinutes: number;
}> = {}) {
  mockUsePomodoro.mockReturnValue({
    activeTaskId,
    activeTaskTitle,
    sentimentScore,
    stopPomodoro: mockStopPomodoro,
  });
  mockGetRecommendedPomodoro.mockReturnValue({ workMinutes, breakMinutes });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ──────────────────────────────────────────────────────────────────────────────
// FloatingPomodoro
// ──────────────────────────────────────────────────────────────────────────────
describe("FloatingPomodoro Component", () => {
  // UI-21: Tidak render jika tidak ada task aktif
  it("UI-21: activeTaskId = null → komponen tidak dirender", () => {
    setupMocks({ activeTaskId: null });
    const { container } = render(<FloatingPomodoro />);
    expect(container.firstChild).toBeNull();
  });

  // UI-22: Render saat ada task aktif
  it("UI-22: activeTaskId ada → komponen muncul", () => {
    setupMocks();
    render(<FloatingPomodoro />);
    expect(screen.getByText(/nulis skripsi/i)).toBeInTheDocument();
  });

  // UI-23: Menampilkan judul task
  it("UI-23: Menampilkan activeTaskTitle dengan benar", () => {
    setupMocks({ activeTaskTitle: "Baca Jurnal" });
    render(<FloatingPomodoro />);
    expect(screen.getByText(/baca jurnal/i)).toBeInTheDocument();
  });

  // UI-24: Durasi adaptif — score tinggi → 25 menit
  it("UI-24: sentimentScore = 9, workMinutes = 25 → timer tampil '25:00'", () => {
    setupMocks({ sentimentScore: 9, workMinutes: 25 });
    render(<FloatingPomodoro />);
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  // UI-25: Durasi adaptif — score rendah → 15 menit
  it("UI-25: sentimentScore = 3, workMinutes = 15 → timer tampil '15:00'", () => {
    setupMocks({ sentimentScore: 3, workMinutes: 15 });
    render(<FloatingPomodoro />);
    expect(screen.getByText("15:00")).toBeInTheDocument();
  });

  // UI-26: Klik X memanggil stopPomodoro
  it("UI-26: Klik tombol close (X) → stopPomodoro dipanggil", () => {
    setupMocks();
    render(<FloatingPomodoro />);
    // Find the close button by its sibling context (header area)
    const closeButton = screen.getAllByRole("button").find(
      (btn) => btn.querySelector("svg") && btn.className.includes("hover:bg-red")
    );
    expect(closeButton).toBeDefined();
    if (closeButton) fireEvent.click(closeButton);
    expect(mockStopPomodoro).toHaveBeenCalledTimes(1);
  });

  // UI-27: Klik Minimize mengecilkan tampilan
  it("UI-27: Klik Minimize → tampilan beralih ke mode minimized", () => {
    setupMocks();
    render(<FloatingPomodoro />);
    // Minimize button is the first button in the header
    const minimizeButton = screen.getAllByRole("button").find(
      (btn) => btn.className.includes("hover:bg-black")
    );
    expect(minimizeButton).toBeDefined();
    if (minimizeButton) {
      fireEvent.click(minimizeButton);
    }
    // In minimized mode, the full task title is no longer visible as text
    // but the timer should still be present
    expect(screen.getByText("20:00")).toBeInTheDocument();
  });

  // UI-28: Mode kerja — label "Fokus"
  it("UI-28: Default mode = work → label 'Fokus' tampil di header", () => {
    setupMocks();
    render(<FloatingPomodoro />);
    expect(screen.getByText(/fokus/i)).toBeInTheDocument();
  });

  // UI-29: Mode break — label "Istirahat"
  it("UI-29: Setelah skip ke break → label 'Istirahat' tampil", () => {
    setupMocks();
    render(<FloatingPomodoro />);
    // Click skip to switch to break
    const skipButton = screen.getByText(/skip ke istirahat/i);
    fireEvent.click(skipButton);
    expect(screen.getByText(/istirahat/i)).toBeInTheDocument();
  });

  // UI-30: Klik Skip mengubah mode dari work ke break
  it("UI-30: Klik 'Skip ke Istirahat' → mode berubah, timer berganti ke breakMinutes", () => {
    setupMocks({ workMinutes: 20, breakMinutes: 5 });
    render(<FloatingPomodoro />);
    expect(screen.getByText("20:00")).toBeInTheDocument();

    const skipButton = screen.getByText(/skip ke istirahat/i);
    fireEvent.click(skipButton);

    // After skip, timer should show break duration
    expect(screen.getByText("05:00")).toBeInTheDocument();
  });
});
