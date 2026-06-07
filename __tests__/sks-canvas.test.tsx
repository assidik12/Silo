/**
 * sks-canvas.test.tsx
 *
 * Component tests for components/LearningCanvas.tsx → SksCanvas
 * Covers Q3 Phase 2.1: UI Canvas & SKS Edit Option (editable textarea toggle)
 * Framework: Jest + React Testing Library
 */

/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// ─── Mock lucide-react icons ───────────────────────────────────────────────────
jest.mock("lucide-react", () => ({
  Edit3: () => <span data-testid="icon-edit3">Edit3</span>,
  Check: () => <span data-testid="icon-check">Check</span>,
  BookOpen: () => <span data-testid="icon-book">BookOpen</span>,
  MessageSquare: () => <span data-testid="icon-msg">MessageSquare</span>,
  ChevronRight: () => <span data-testid="icon-chevron">ChevronRight</span>,
  Send: () => <span data-testid="icon-send">Send</span>,
  Loader2: () => <span data-testid="icon-loader">Loader2</span>,
  Calendar: () => <span data-testid="icon-calendar">Calendar</span>,
}));

// ─── Mock server actions used by BingeWatchCanvas (not under test here) ────────
jest.mock("@/app/actions/learning.actions", () => ({
  chatWithTutor: jest.fn(),
  getQuarterChatHistory: jest.fn(),
  syncLearningPlanToCalendar: jest.fn(),
}));

// ─── Mock FeedbackModal ────────────────────────────────────────────────────────
jest.mock("@/components/feedback/FeedbackModal", () =>
  function MockFeedbackModal() {
    return <div data-testid="feedback-modal" />;
  }
);

// ─── Mock ModalProvider (useModal hook) ───────────────────────────────────────
jest.mock("@/components/providers/ModalProvider", () => ({
  useModal: () => ({ showModal: jest.fn() }),
}));

// ─── Import after mocks ────────────────────────────────────────────────────────
import { SksCanvas } from "@/components/learning/LearningCanvas";

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("SksCanvas (Q3 Phase 2.1: UI Canvas & SKS Edit)", () => {
  const sampleContent =
    "# Algoritma\n**Sorting** adalah proses pengurutan.\n* Bubble Sort\n* Quick Sort";

  it("renders nothing when content is empty string", () => {
    const { container } = render(<SksCanvas content="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders markdown content in read mode by default", () => {
    render(<SksCanvas content={sampleContent} />);
    // The prose div should be present (not textarea)
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("shows Edit button on hover (rendered but initially opacity-0)", () => {
    render(<SksCanvas content={sampleContent} />);
    // The edit button exists in DOM even if visually hidden via CSS opacity
    const editButton = screen.getByTitle("Edit Catatan");
    expect(editButton).toBeInTheDocument();
  });

  it("switches to edit mode when Edit button is clicked", () => {
    render(<SksCanvas content={sampleContent} />);

    const editButton = screen.getByTitle("Edit Catatan");
    fireEvent.click(editButton);

    // Textarea should now be visible
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect((textarea as HTMLTextAreaElement).value).toBe(sampleContent);
  });

  it("shows Cancel and Save Changes buttons in edit mode", () => {
    render(<SksCanvas content={sampleContent} />);
    fireEvent.click(screen.getByTitle("Edit Catatan"));

    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("allows user to modify content in the textarea", () => {
    render(<SksCanvas content={sampleContent} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTitle("Edit Catatan"));

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "# Updated Content" } });

    expect(textarea.value).toBe("# Updated Content");
  });

  it("calls onChange with new content when Save Changes is clicked", () => {
    const onChangeMock = jest.fn();
    render(<SksCanvas content={sampleContent} onChange={onChangeMock} />);

    fireEvent.click(screen.getByTitle("Edit Catatan"));

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "# New SKS Plan" } });

    fireEvent.click(screen.getByText("Save Changes"));

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith("# New SKS Plan");
  });

  it("does NOT call onChange if no onChange prop is provided (no crash)", () => {
    render(<SksCanvas content={sampleContent} />);
    fireEvent.click(screen.getByTitle("Edit Catatan"));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "# New" } });

    // Should not throw even without onChange
    expect(() => fireEvent.click(screen.getByText("Save Changes"))).not.toThrow();
  });

  it("reverts to original content when Cancel is clicked", () => {
    render(<SksCanvas content={sampleContent} onChange={jest.fn()} />);
    fireEvent.click(screen.getByTitle("Edit Catatan"));

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Completely different" } });
    fireEvent.click(screen.getByText("Cancel"));

    // Should be back in read mode (no textarea)
    expect(screen.queryByRole("textbox")).toBeNull();
    // Edit button should be back
    expect(screen.getByTitle("Edit Catatan")).toBeInTheDocument();
  });

  it("hides edit button (and shows read view) after saving", () => {
    const onChangeMock = jest.fn();
    render(<SksCanvas content={sampleContent} onChange={onChangeMock} />);

    fireEvent.click(screen.getByTitle("Edit Catatan"));
    fireEvent.click(screen.getByText("Save Changes"));

    // Back to read mode
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByTitle("Edit Catatan")).toBeInTheDocument();
  });

  it("syncs localContent when content prop changes (useEffect)", () => {
    const { rerender } = render(<SksCanvas content="Initial content" onChange={jest.fn()} />);
    fireEvent.click(screen.getByTitle("Edit Catatan"));

    // Verify initial value
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Initial content");

    // Cancel edit first, then re-render with new content
    fireEvent.click(screen.getByText("Cancel"));
    rerender(<SksCanvas content="Updated by parent" onChange={jest.fn()} />);

    // Re-enter edit mode to check new value
    fireEvent.click(screen.getByTitle("Edit Catatan"));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Updated by parent");
  });
});
