/**
 * learning-actions.test.ts
 *
 * Unit tests for app/actions/learning.actions.ts
 * Mocks: Supabase, next/headers cookies, googleapis drive, Gemini, pdf parser.
 */

import type { ActionResponse } from "@/types";

const cookiesGetMock = jest.fn();
const cookiesSetMock = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: (...args: unknown[]) => cookiesGetMock(...args),
    getAll: jest.fn(() => []),
    set: (...args: unknown[]) => cookiesSetMock(...args),
  })),
}));

type SupabaseMock = {
  auth: {
    getSession: jest.Mock;
    getUser: jest.Mock;
  };
  from: jest.Mock;
  rpc: jest.Mock;
};

function makeSupabaseMock(): SupabaseMock {
  return {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  };
}

const createClientMock = jest.fn();

jest.mock("@/utils/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

const parsePdfBufferMock = jest.fn();
const chunkTextMock = jest.fn();

jest.mock("@/utils/pdfParser", () => ({
  parsePdfBuffer: (...args: unknown[]) => parsePdfBufferMock(...args),
  chunkText: (...args: unknown[]) => chunkTextMock(...args),
}));

const embedContentMock = jest.fn();
const generateContentMock = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      embedContent: (...args: unknown[]) => embedContentMock(...args),
      generateContent: (...args: unknown[]) => generateContentMock(...args),
    },
  })),
}));

const driveListMock = jest.fn();
const driveGetMock = jest.fn();

jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    drive: jest.fn().mockReturnValue({
      files: {
        list: (...args: unknown[]) => driveListMock(...args),
        get: (...args: unknown[]) => driveGetMock(...args),
      },
    }),
  },
}));

// Import after mocks
import { syncGoogleDriveFolder, generateSKSSummary } from "@/app/actions/learning.actions";

describe("learning.actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("syncGoogleDriveFolder", () => {
    it("returns unauthorized when google drive token missing", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } }, error: null });
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      createClientMock.mockReturnValue(supabase);

      cookiesGetMock.mockReturnValue(undefined);

      const res = (await syncGoogleDriveFolder("https://drive.google.com/drive/folders/abc")) as ActionResponse;
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/token missing|unauthorized/i);
    });

    it("returns error on invalid folder url", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } }, error: null });
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      createClientMock.mockReturnValue(supabase);

      cookiesGetMock.mockReturnValue({ value: "g-token" });

      const res = (await syncGoogleDriveFolder("https://example.com/not-drive")) as ActionResponse;
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/invalid google drive folder url/i);
    });

    it("returns error when no PDFs found", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } }, error: null });
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      createClientMock.mockReturnValue(supabase);

      cookiesGetMock.mockReturnValue({ value: "g-token" });
      driveListMock.mockResolvedValue({ data: { files: [] } });

      const res = (await syncGoogleDriveFolder("https://drive.google.com/drive/folders/abc")) as ActionResponse;
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/no pdf files/i);
    });

    it("processes files and inserts chunks when everything is OK", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } }, error: null });
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

      const folderInsertSelectSingle = jest.fn().mockResolvedValue({ data: { id: "folder-db-1" }, error: null });
      const chunksInsert = jest.fn().mockResolvedValue({ error: null });

      supabase.from.mockImplementation((table: string) => {
        if (table === "learning_folders") {
          return {
            insert: () => ({
              select: () => ({
                single: folderInsertSelectSingle,
              }),
            }),
          };
        }
        if (table === "document_chunks") {
          return {
            insert: chunksInsert,
          };
        }
        throw new Error(`Unexpected table ${table}`);
      });

      createClientMock.mockReturnValue(supabase);

      cookiesGetMock.mockReturnValue({ value: "g-token" });

      driveListMock.mockResolvedValue({ data: { files: [{ id: "f1", name: "a.pdf" }] } });
      driveGetMock.mockResolvedValue({ data: new ArrayBuffer(8) });

      parsePdfBufferMock.mockResolvedValue("hello world");
      chunkTextMock.mockReturnValue(["chunk1", "chunk2"]);

      embedContentMock.mockResolvedValue({ embeddings: [{ values: [0.1, 0.2] }] });

      const res = (await syncGoogleDriveFolder("https://drive.google.com/drive/folders/abc")) as ActionResponse;
      expect(res.success).toBe(true);
      expect(folderInsertSelectSingle).toHaveBeenCalledTimes(1);
      expect(chunksInsert).toHaveBeenCalledTimes(2);
    });
  });

  describe("generateSKSSummary", () => {
    it("returns error when rpc fails", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      supabase.rpc.mockResolvedValue({ data: null, error: { message: "rpc" } });
      createClientMock.mockReturnValue(supabase);

      embedContentMock.mockResolvedValue({ embeddings: [{ values: [0.1, 0.2] }] });

      const res = (await generateSKSSummary("folder1")) as ActionResponse;
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/vector search failed/i);
    });

    it("returns parsed JSON when chunks exist", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      supabase.rpc.mockResolvedValue({ data: [{ content: "c1" }, { content: "c2" }], error: null });
      createClientMock.mockReturnValue(supabase);

      embedContentMock.mockResolvedValue({ embeddings: [{ values: [0.1, 0.2] }] });
      generateContentMock.mockResolvedValue({ text: '{"title":"T","content":"C"}' });

      const res = (await generateSKSSummary("folder1")) as ActionResponse;
      expect(res.success).toBe(true);
      expect(res.data).toMatchObject({ title: "T", content: "C" });
    });
  });
});
