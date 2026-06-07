/**
 * @jest-environment jsdom
 *
 * shareable-canvas-modal.test.tsx
 *
 * Component tests for components/dashboard/ShareableCanvasModal.tsx
 * Covers Walkthrough Item #4 — Shareable Canvas & Public Profile
 *
 * Framework: Jest + React Testing Library
 * Rules:
 *  - Mock html-to-image (no DOM canvas in jsdom), navigator.share, navigator.clipboard
 *  - Focus on interaction: modal open/close, download, share link
 *  - TypeScript strict — ShareableCanvasProps used explicitly
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ShareableCanvasModal from '@/components/dashboard/ShareableCanvasModal';

// ─── Mock lucide-react icons ──────────────────────────────────────────────────
jest.mock('lucide-react', () => ({
  Camera: () => <span data-testid="icon-camera">📷</span>,
  X: () => <span data-testid="icon-x">✕</span>,
  Download: () => <span data-testid="icon-download">⬇</span>,
  Link: () => <span data-testid="icon-link">🔗</span>,
  Share2: () => <span data-testid="icon-share2">🔗</span>,
}));

// ─── Mock html-to-image: prevent DOM/canvas errors in jsdom ──────────────────
jest.mock('html-to-image', () => ({
  toJpeg: jest.fn().mockResolvedValue('data:image/jpeg;base64,mockImageData'),
}));

// ─── Default props ────────────────────────────────────────────────────────────
const DEFAULT_PROPS = {
  userId: 'user-123',
  name: 'Raka',
  streak: 14,
  xp: 750,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function openModal() {
  fireEvent.click(screen.getByRole('button', { name: /Flex Progress/i }));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ShareableCanvasModal — Trigger Button', () => {
  it('renders the "Flex Progress" trigger button', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    expect(screen.getByRole('button', { name: /Flex Progress/i })).toBeInTheDocument();
  });

  it('modal is NOT visible before the trigger button is clicked', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    expect(screen.queryByText(/Flex Your Progress!/i)).toBeNull();
  });
});

describe('ShareableCanvasModal — Modal Open/Close', () => {
  it('opens the modal and shows the title when trigger is clicked', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    expect(screen.getByText(/Flex Your Progress!/i)).toBeInTheDocument();
  });

  it('displays user name in the canvas after opening', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    // The canvas has "{name}'s Stats" heading
    expect(screen.getByText(`${DEFAULT_PROPS.name}'s Stats`)).toBeInTheDocument();
  });

  it('displays streak count in the canvas', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    expect(screen.getByText(String(DEFAULT_PROPS.streak))).toBeInTheDocument();
  });

  it('displays XP in the canvas', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    expect(screen.getByText(String(DEFAULT_PROPS.xp))).toBeInTheDocument();
  });

  it('closes the modal when the X button is clicked', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    const closeButton = screen.getByTestId('icon-x').closest('button') as HTMLButtonElement;
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Flex Your Progress!/i)).toBeNull();
  });
});

describe('ShareableCanvasModal — Download IG Story', () => {
  const { toJpeg } = require('html-to-image') as { toJpeg: jest.Mock };

  beforeEach(() => {
    toJpeg.mockClear();
  });

  it('renders the "Download IG Story" button in the modal', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    expect(screen.getByRole('button', { name: /Download IG Story/i })).toBeInTheDocument();
  });

  it('calls toJpeg when "Download IG Story" button is clicked', async () => {
    // Spy on click via a real anchor element intercepted after creation
    const originalCreateElement = document.createElement.bind(document);
    const mockClick = jest.fn();
    jest
      .spyOn(document, 'createElement')
      .mockImplementation(function (tagName: string) {
        const el = originalCreateElement(tagName);
        if (tagName === 'a') {
          el.click = mockClick;
        }
        return el;
      } as typeof document.createElement);

    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Download IG Story/i }));
    });

    expect(toJpeg).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);

    jest.spyOn(document, 'createElement').mockRestore();
  });

  it('shows "Processing..." text while download is in progress', async () => {
    // Make toJpeg hang indefinitely so we can catch the loading state
    let resolveDownload!: (value: string) => void;
    toJpeg.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        resolveDownload = resolve;
      })
    );

    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Download IG Story/i }));
    });

    expect(await screen.findByText('Processing...')).toBeInTheDocument();

    // Cleanup: resolve promise to avoid open handles
    act(() => {
      resolveDownload('data:image/jpeg;base64,done');
    });
  });

  it('download button is disabled while downloading', async () => {
    let resolveDownload!: (value: string) => void;
    toJpeg.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        resolveDownload = resolve;
      })
    );

    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    const downloadBtn = screen.getByRole('button', { name: /Download IG Story/i });

    act(() => {
      fireEvent.click(downloadBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    expect(screen.getByText('Processing...').closest('button')).toBeDisabled();

    // Cleanup
    act(() => {
      resolveDownload('data:image/jpeg;base64,done');
    });
  });
});

describe('ShareableCanvasModal — Share Link Profile (Web Share API available)', () => {
  const mockShare = jest.fn();

  beforeEach(() => {
    // Simulate mobile-like environment with native share API
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });
    mockShare.mockResolvedValue(undefined);
  });

  afterEach(() => {
    mockShare.mockClear();
  });

  it('calls navigator.share with correct title, text and URL', async () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Share Link Profile/i }));
    });

    expect(mockShare).toHaveBeenCalledTimes(1);
    const shareCallArg = mockShare.mock.calls[0][0] as ShareData;

    // Title should include the user name
    expect(shareCallArg.title).toContain(DEFAULT_PROPS.name);

    // URL should contain the userId as part of the share path
    expect(shareCallArg.url).toContain(`/share/${DEFAULT_PROPS.userId}`);
  });

  it('share text mentions streak count', async () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Share Link Profile/i }));
    });

    const shareCallArg = mockShare.mock.calls[0][0] as ShareData;
    expect(shareCallArg.text).toContain(String(DEFAULT_PROPS.streak));
  });
});

describe('ShareableCanvasModal — Share Link Profile (Clipboard fallback)', () => {
  const mockWriteText = jest.fn();
  const mockAlert = jest.fn();

  beforeEach(() => {
    // Remove native share API to force clipboard fallback
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
    mockWriteText.mockResolvedValue(undefined);
    global.alert = mockAlert;
  });

  afterEach(() => {
    mockWriteText.mockClear();
    mockAlert.mockClear();
  });

  it('copies the profile URL to clipboard when Web Share is unavailable', async () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Share Link Profile/i }));
    });

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    // The copied URL should contain the userId
    const copiedUrl = mockWriteText.mock.calls[0][0] as string;
    expect(copiedUrl).toContain(`/share/${DEFAULT_PROPS.userId}`);
  });

  it('shows an alert confirming link has been copied', async () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Share Link Profile/i }));
    });

    expect(mockAlert).toHaveBeenCalledTimes(1);
    expect(mockAlert).toHaveBeenCalledWith(
      expect.stringContaining('disalin')
    );
  });
});

describe('ShareableCanvasModal — Canvas Content Integrity', () => {
  it('renders the "DoJo App" branding text inside canvas', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    expect(screen.getByText('DoJo App')).toBeInTheDocument();
  });

  it('renders the footer tagline inside canvas', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    expect(screen.getByText(/gamify your student life/i)).toBeInTheDocument();
  });

  it('renders "Streak" label in canvas', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    expect(screen.getByText('Streak')).toBeInTheDocument();
  });

  it('renders "Total XP" label in canvas', () => {
    render(<ShareableCanvasModal {...DEFAULT_PROPS} />);
    openModal();

    expect(screen.getByText('Total XP')).toBeInTheDocument();
  });
});
