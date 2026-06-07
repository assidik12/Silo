/**
 * @jest-environment node
 *
 * learning-actions.test.ts
 *
 * Unit tests for app/actions/learning.actions.ts
 * Updated mocks to match current production code:
 * - Uses getAiResponse + getEmbedding from lib/ai-config (NOT direct GoogleGenAI)
 * - syncGoogleDriveFolder checks user + provider_token (not just user)
 * - generateSKSSummary throws rpcError directly (not wraps it)
 */

import type { ActionResponse } from "@/types";

// ─── Mock: next/headers ────────────────────────────────────────────────────────
const cookiesGetMock = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: (...args: unknown[]) => cookiesGetMock(...args),
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

// ─── Mock: next/cache ─────────────────────────────────────────────────────────
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

// ─── Mock: googleapis ─────────────────────────────────────────────────────────
const driveFilesListMock = jest.fn();
const driveFilesGetMock = jest.fn();

jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    drive: jest.fn(() => ({
      files: {
        list: (...args: unknown[]) => driveFilesListMock(...args),
        get: (...args: unknown[]) => driveFilesGetMock(...args),
      },
    })),
  },
}));

// ─── Mock: lib/ai-config ──────────────────────────────────────────────────────
const getAiResponseMock = jest.fn();
const getEmbeddingMock = jest.fn();

jest.mock("@/lib/ai/config", () => ({
  getAiResponse: (...args: unknown[]) => getAiResponseMock(...args),
  getEmbedding: (...args: unknown[]) => getEmbeddingMock(...args),
  aiClient: {},
  AI_MODELS: { PRIMARY_GENERATION: "gemini-2.5-flash", FALLBACK_GENERATION: "gemini-pro", EMBEDDING: "gemini-embedding-2" },
}));

// ─── Mock: utils/pdfParser ────────────────────────────────────────────────────
const parsePdfBufferMock = jest.fn();
const chunkTextMock = jest.fn();

jest.mock("@/utils/pdfParser", () => ({
  parsePdfBuffer: (...args: unknown[]) => parsePdfBufferMock(...args),
  chunkText: (...args: unknown[]) => chunkTextMock(...args),
}));

// ─── Mock: lib/googleCalendar ─────────────────────────────────────────────────
const createEventMock = jest.fn();
jest.mock("@/lib/google/calendar", () => ({
  createEvent: (...args: unknown[]) => createEventMock(...args),
}));

// ─── Supabase mock factory ────────────────────────────────────────────────────
function makeSupabaseMock() {
  return {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  };
}

const createClientMock = jest.fn();
jest.mock("@/utils/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

// ─── Import after mocks ────────────────────────────────────────────────────────
import {
  syncGoogleDriveFolder,
  generateSKSSummary,
  getLearningHistory,
  saveLearningHistory,
} from "@/app/actions/learning.actions";

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("learning.actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: provider token is present
    cookiesGetMock.mockImplementation((key: string) => {
      if (key === "g_provider_token") return { value: "test-provider-token" };
      return undefined;
    });
  });

  // ══════════════════════════════════════════════════════════════
  // syncGoogleDriveFolder
  // ══════════════════════════════════════════════════════════════
  describe("syncGoogleDriveFolder", () => {
    it("returns unauthorized when user is missing", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await syncGoogleDriveFolder("https://drive.google.com/drive/folders/abc");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unauthorized/i);
    });

    it("returns unauthorized when provider token is missing", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      createClientMock.mockReturnValue(supabase);

      // No provider token
      cookiesGetMock.mockReturnValue(undefined);

      const res = await syncGoogleDriveFolder("https://drive.google.com/drive/folders/abc");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unauthorized|google/i);
    });

    it("returns error for invalid Google Drive URL", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      createClientMock.mockReturnValue(supabase);

      // When URL has no 'folders/' segment, the whole URL becomes folderId.
      // The Drive API call will fail — simulate that failure.
      driveFilesListMock.mockRejectedValue(new Error("Invalid Value"));

      const res = await syncGoogleDriveFolder("https://not-a-drive-url.com");
      expect(res.success).toBe(false);
      // The error propagates from the caught exception — just check it's a non-success
      expect(typeof res.error).toBe("string");
      expect(res.error!.length).toBeGreaterThan(0);
    });

    it("returns error when no PDF files in folder", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      createClientMock.mockReturnValue(supabase);

      driveFilesListMock.mockResolvedValue({ data: { files: [] } });

      const res = await syncGoogleDriveFolder("https://drive.google.com/drive/folders/abc123");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/no pdf|not found/i);
    });

    it("processes files and returns success when folder exists and files are new", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      createClientMock.mockReturnValue(supabase);

      // Google Drive returns 1 PDF
      driveFilesListMock.mockResolvedValue({
        data: { files: [{ id: "file1", name: "Materi.pdf" }] },
      });
      driveFilesGetMock.mockResolvedValue({ data: new ArrayBuffer(8) });

      // PDF parsing
      parsePdfBufferMock.mockResolvedValue("Chunk content 1. Chunk content 2.");
      chunkTextMock.mockReturnValue(["Chunk content 1.", "Chunk content 2."]);

      // Embedding
      getEmbeddingMock.mockResolvedValue([0.1, 0.2, 0.3]);

      // Supabase: folder already exists
      const folderSingleMock = jest.fn().mockResolvedValue({ data: { id: "folder-db-1" } });
      const existingChunksSelectMock = jest.fn().mockResolvedValue({ data: [] });
      const chunkInsertMock = jest.fn().mockResolvedValue({ error: null });

      supabase.from.mockImplementation((table: string) => {
        if (table === "learning_folders") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: folderSingleMock,
                }),
              }),
            }),
          };
        }
        if (table === "document_chunks") {
          return {
            select: () => ({
              eq: () => existingChunksSelectMock(),
            }),
            insert: chunkInsertMock,
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      });

      const res = await syncGoogleDriveFolder("https://drive.google.com/drive/folders/abc123");
      expect(res.success).toBe(true);
      expect(chunkInsertMock).toHaveBeenCalledTimes(2); // 2 chunks inserted
    });
  });

  // ══════════════════════════════════════════════════════════════
  // generateSKSSummary
  // ══════════════════════════════════════════════════════════════
  describe("generateSKSSummary", () => {
    it("returns error when embedding fails", async () => {
      getEmbeddingMock.mockResolvedValue(null); // no embedding

      const supabase = makeSupabaseMock();
      createClientMock.mockReturnValue(supabase);

      const res = await generateSKSSummary("folder1");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/embedding/i);
    });

    it("returns error when rpc vector search fails", async () => {
      getEmbeddingMock.mockResolvedValue([0.1, 0.2]);

      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      supabase.rpc.mockResolvedValue({ data: null, error: { message: "vector search failed" } });
      createClientMock.mockReturnValue(supabase);

      const res = await generateSKSSummary("folder1");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/vector search failed/i);
    });

    it("returns parsed JSON when chunks exist and AI responds", async () => {
      getEmbeddingMock.mockResolvedValue([0.1, 0.2]);
      getAiResponseMock.mockResolvedValue('{"title":"SKS Cepat","content":"## Rangkuman..."}');

      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });

      // rpc returns chunks
      supabase.rpc.mockResolvedValue({
        data: [{ content: "Materi bab 1." }, { content: "Materi bab 2." }],
        error: null,
      });

      // users profile query
      supabase.from.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: { name: "Budi", major: "TI", interests: "AI", learning_type: "ngebut" },
                }),
              }),
            }),
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await generateSKSSummary("folder1");
      expect(res.success).toBe(true);
      expect(res.data).toMatchObject({ title: "SKS Cepat", content: expect.any(String) });
    });
  });

  // ══════════════════════════════════════════════════════════════
  // getLearningHistory
  // ══════════════════════════════════════════════════════════════
  describe("getLearningHistory", () => {
    it("returns unauthorized when no user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await getLearningHistory();
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unauthorized/i);
    });

    it("returns empty array when no history exists", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      supabase.from.mockImplementation((table: string) => {
        if (table === "learning_history") {
          return {
            select: () => ({
              eq: () => ({
                order: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await getLearningHistory();
      expect(res.success).toBe(true);
      expect(res.data).toEqual([]);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // saveLearningHistory
  // ══════════════════════════════════════════════════════════════
  describe("saveLearningHistory", () => {
    it("returns unauthorized when no user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await saveLearningHistory("f1", "Title", "sks", "content");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unauthorized/i);
    });

    it("inserts history record and returns success", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      const insertMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation((table: string) => {
        if (table === "learning_history") return { insert: insertMock };
        throw new Error(`Unexpected table: ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await saveLearningHistory("f1", "Rangkuman SKS", "sks", { title: "T", content: "C" });
      expect(res.success).toBe(true);
      expect(insertMock).toHaveBeenCalledTimes(1);
    });
  });
});
