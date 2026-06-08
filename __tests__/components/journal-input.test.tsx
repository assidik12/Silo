import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import JournalInput from "@/components/wellness/journal-input";

const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
const mockOnPersonaChange = jest.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  isLoading: false,
  selectedPersona: "mindful" as const,
  onPersonaChange: mockOnPersonaChange,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("JournalInput Component", () => {
  // UI-01: Tombol submit disabled saat input kosong
  it("UI-01: Tombol 'Rapikan Pikiranku' disabled saat textarea kosong", () => {
    render(<JournalInput {...defaultProps} />);
    const button = screen.getByRole("button", { name: /rapikan pikiranku/i });
    expect(button).toBeDisabled();
  });

  // UI-02: Tombol aktif setelah ada input
  it("UI-02: Tombol aktif setelah user mengetik teks", () => {
    render(<JournalInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/tulis aja semuanya/i);
    fireEvent.change(textarea, { target: { value: "Hari ini capek banget." } });
    const button = screen.getByRole("button", { name: /rapikan pikiranku/i });
    expect(button).not.toBeDisabled();
  });

  // UI-03: Submit dipanggil dengan nilai teks yang benar
  it("UI-03: Klik submit → onSubmit dipanggil dengan teks yang diketik", () => {
    render(<JournalInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/tulis aja semuanya/i);
    fireEvent.change(textarea, { target: { value: "Curhat hari ini" } });
    const button = screen.getByRole("button", { name: /rapikan pikiranku/i });
    fireEvent.click(button);
    expect(mockOnSubmit).toHaveBeenCalledWith("Curhat hari ini");
  });

  // UI-04: Teks hanya spasi tidak trigger submit
  it("UI-04: Teks hanya spasi → onSubmit TIDAK dipanggil", () => {
    render(<JournalInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/tulis aja semuanya/i);
    fireEvent.change(textarea, { target: { value: "   " } });
    const button = screen.getByRole("button", { name: /rapikan pikiranku/i });
    fireEvent.click(button);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // UI-05: Loading state — tampil spinner dan teks "Memproses..."
  it("UI-05: isLoading = true → tampil teks 'Memproses...'", () => {
    render(<JournalInput {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/memproses/i)).toBeInTheDocument();
  });

  // UI-06: Tombol disabled saat loading meskipun ada teks
  it("UI-06: isLoading = true → tombol disabled meski ada teks", () => {
    render(<JournalInput {...defaultProps} isLoading={true} />);
    const textarea = screen.getByPlaceholderText(/tulis aja semuanya/i);
    fireEvent.change(textarea, { target: { value: "Ada teks" } });
    // Find button by text since it changes when loading
    const button = screen.getByRole("button", { name: /memproses/i });
    expect(button).toBeDisabled();
  });

  // UI-07: Klik persona Savage
  it("UI-07: Klik tombol '🔥 Savage' → onPersonaChange('savage') dipanggil", () => {
    render(<JournalInput {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /savage/i }));
    expect(mockOnPersonaChange).toHaveBeenCalledWith("savage");
  });

  // UI-08: Klik persona Aesthetic
  it("UI-08: Klik tombol '✨ Aesthetic' → onPersonaChange('aesthetic') dipanggil", () => {
    render(<JournalInput {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /aesthetic/i }));
    expect(mockOnPersonaChange).toHaveBeenCalledWith("aesthetic");
  });

  // UI-09: Klik persona Mindful
  it("UI-09: Klik tombol '🌿 Mindful' → onPersonaChange('mindful') dipanggil", () => {
    render(<JournalInput {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /mindful/i }));
    expect(mockOnPersonaChange).toHaveBeenCalledWith("mindful");
  });

  // UI-10: Persona terpilih memiliki class aktif yang berbeda
  it("UI-10: selectedPersona='savage' → tombol Savage memiliki class aktif berbeda", () => {
    render(<JournalInput {...defaultProps} selectedPersona="savage" />);
    const savageButton = screen.getByRole("button", { name: /savage/i });
    // Active persona has text-red-500 class, others are slate-500
    expect(savageButton.className).toMatch(/red/);
  });
});
