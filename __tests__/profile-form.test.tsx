/**
 * profile-form.test.tsx
 *
 * Component tests for components/ProfileForm.tsx
 * Covers Q3 Phase 1.2: Full Profile & Preference Edit (UI layer)
 * Framework: Jest + React Testing Library
 */

/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ─── Mock lucide-react icons ───────────────────────────────────────────────────
jest.mock("lucide-react", () => ({
  Loader2: () => <span data-testid="icon-loader">Loader2</span>,
  Check: () => <span data-testid="icon-check">Check</span>,
  User: () => <span data-testid="icon-user">User</span>,
  GraduationCap: () => <span data-testid="icon-grad">GraduationCap</span>,
  Clock: () => <span data-testid="icon-clock">Clock</span>,
  Heart: () => <span data-testid="icon-heart">Heart</span>,
  Zap: () => <span data-testid="icon-zap">Zap</span>,
  Coffee: () => <span data-testid="icon-coffee">Coffee</span>,
}));

// ─── Mock: updateUserProfile server action ────────────────────────────────────
const updateUserProfileMock = jest.fn();
jest.mock("@/app/actions/user.actions", () => ({
  updateUserProfile: (...args: unknown[]) => updateUserProfileMock(...args),
}));

// ─── Import after mocks ────────────────────────────────────────────────────────
import ProfileForm from "@/components/ProfileForm";

// ─── Test data ────────────────────────────────────────────────────────────────
const initialData = {
  name: "Budi Santoso",
  major: "Teknik Informatika",
  bio: "Suka ngoding",
  interests: "AI, Musik",
  productive_hours: "09:00",
  learning_type: "santai" as const,
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("ProfileForm (Q3 Phase 1.2: Full Profile Edit UI)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering & Initial State ──────────────────────────────────────────────
  describe("Initial Render", () => {
    it("renders all form fields correctly", () => {
      render(<ProfileForm initialData={initialData} />);

      expect(screen.getByPlaceholderText(/masukkan nama lo/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/teknik informatika/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/09:00 atau malam hari/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/ai, musik, coding/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/ceritain dikit/i)).toBeInTheDocument();
    });

    it("pre-fills all fields with initialData values", () => {
      render(<ProfileForm initialData={initialData} />);

      expect(
        (screen.getByPlaceholderText(/masukkan nama lo/i) as HTMLInputElement).value,
      ).toBe("Budi Santoso");
      expect(
        (screen.getByPlaceholderText(/teknik informatika/i) as HTMLInputElement).value,
      ).toBe("Teknik Informatika");
      expect(
        (screen.getByPlaceholderText(/ceritain dikit/i) as HTMLTextAreaElement).value.trim(),
      ).toBe("Suka ngoding");
    });

    it("renders with empty strings when initialData is null", () => {
      render(<ProfileForm initialData={null} />);

      expect(
        (screen.getByPlaceholderText(/masukkan nama lo/i) as HTMLInputElement).value,
      ).toBe("");
    });

    it("shows Ngebut and Santai learning type buttons", () => {
      render(<ProfileForm initialData={initialData} />);
      expect(screen.getByText(/ngebut \(sks\)/i)).toBeInTheDocument();
      expect(screen.getByText(/santai \(binge-watch\)/i)).toBeInTheDocument();
    });

    it("renders the submit button with text 'Update Profil'", () => {
      render(<ProfileForm initialData={initialData} />);
      expect(screen.getByRole("button", { name: /update profil/i })).toBeInTheDocument();
    });
  });

  // ── Form Interaction ───────────────────────────────────────────────────────
  describe("Form Interaction", () => {
    it("updates name field when user types", () => {
      render(<ProfileForm initialData={initialData} />);
      const nameInput = screen.getByPlaceholderText(/masukkan nama lo/i) as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: "Siti Rahayu" } });
      expect(nameInput.value).toBe("Siti Rahayu");
    });

    it("switches learning_type to 'ngebut' when Ngebut button is clicked", () => {
      render(<ProfileForm initialData={{ ...initialData, learning_type: "santai" }} />);

      const ngebut = screen.getByText(/ngebut \(sks\)/i).closest("button")!;
      fireEvent.click(ngebut);

      // Ngebut button should now have active style class (border-indigo-600)
      expect(ngebut.className).toContain("border-indigo-600");
    });

    it("switches learning_type to 'santai' when Santai button is clicked", () => {
      render(<ProfileForm initialData={{ ...initialData, learning_type: "ngebut" }} />);

      const santai = screen.getByText(/santai \(binge-watch\)/i).closest("button")!;
      fireEvent.click(santai);

      expect(santai.className).toContain("border-emerald-600");
    });
  });

  // ── Form Submission – Success ──────────────────────────────────────────────
  describe("Form Submission – Success", () => {
    it("calls updateUserProfile with correct form data on submit", async () => {
      updateUserProfileMock.mockResolvedValue({ success: true });
      render(<ProfileForm initialData={initialData} />);

      // Modify a field
      fireEvent.change(screen.getByPlaceholderText(/masukkan nama lo/i), {
        target: { value: "Andi Wijaya" },
      });

      fireEvent.submit(screen.getByRole("button", { name: /update profil/i }).closest("form")!);

      await waitFor(() => {
        expect(updateUserProfileMock).toHaveBeenCalledTimes(1);
        expect(updateUserProfileMock).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Andi Wijaya" }),
        );
      });
    });

    it("shows 'Berhasil Disimpan!' text after successful submit", async () => {
      updateUserProfileMock.mockResolvedValue({ success: true });
      render(<ProfileForm initialData={initialData} />);

      fireEvent.submit(screen.getByRole("button", { name: /update profil/i }).closest("form")!);

      await waitFor(() => {
        expect(screen.getByText(/berhasil disimpan/i)).toBeInTheDocument();
      });
    });

    it("disables submit button while loading", async () => {
      // Make the mock hang
      updateUserProfileMock.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 200)),
      );
      render(<ProfileForm initialData={initialData} />);

      const submitButton = screen.getByRole("button", { name: /update profil/i });
      fireEvent.submit(submitButton.closest("form")!);

      // Button should be disabled immediately
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  // ── Form Submission – Error ────────────────────────────────────────────────
  describe("Form Submission – Error", () => {
    it("displays error message when updateUserProfile returns failure", async () => {
      updateUserProfileMock.mockResolvedValue({
        success: false,
        error: "Gagal memperbarui profil",
      });
      render(<ProfileForm initialData={initialData} />);

      fireEvent.submit(screen.getByRole("button", { name: /update profil/i }).closest("form")!);

      await waitFor(() => {
        expect(screen.getByText(/gagal memperbarui profil/i)).toBeInTheDocument();
      });
    });

    it("displays fallback error message when error field is missing", async () => {
      updateUserProfileMock.mockResolvedValue({ success: false });
      render(<ProfileForm initialData={initialData} />);

      fireEvent.submit(screen.getByRole("button", { name: /update profil/i }).closest("form")!);

      await waitFor(() => {
        expect(screen.getByText(/gagal memperbarui profil/i)).toBeInTheDocument();
      });
    });

    it("displays system error message when action throws unexpectedly", async () => {
      updateUserProfileMock.mockRejectedValue(new Error("Network crash"));
      render(<ProfileForm initialData={initialData} />);

      fireEvent.submit(screen.getByRole("button", { name: /update profil/i }).closest("form")!);

      await waitFor(() => {
        expect(screen.getByText(/terjadi kesalahan sistem/i)).toBeInTheDocument();
      });
    });

    it("clears previous error before new submission", async () => {
      // First fail
      updateUserProfileMock.mockResolvedValueOnce({
        success: false,
        error: "First error",
      });
      render(<ProfileForm initialData={initialData} />);
      const form = screen.getByRole("button", { name: /update profil/i }).closest("form")!;

      fireEvent.submit(form);
      await waitFor(() => screen.getByText(/first error/i));

      // Then succeed
      updateUserProfileMock.mockResolvedValue({ success: true });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText(/first error/i)).toBeNull();
      });
    });
  });
});
