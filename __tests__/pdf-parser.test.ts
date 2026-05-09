/**
 * pdf-parser.test.ts
 *
 * Unit tests for utils/pdfParser.ts
 */

import { chunkText, parsePdfBuffer } from "@/utils/pdfParser";

// Mock pdf2json default export
const onMock = jest.fn();
const parseBufferMock = jest.fn();
const getRawTextContentMock = jest.fn();

jest.mock("pdf2json", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      on: (...args: unknown[]) => onMock(...args),
      parseBuffer: (...args: unknown[]) => parseBufferMock(...args),
      getRawTextContent: (...args: unknown[]) => getRawTextContentMock(...args),
    })),
  };
});

describe("pdfParser utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("chunkText splits text into fixed-sized chunks", () => {
    const chunks = chunkText("abcdefghij", 4);
    expect(chunks).toEqual(["abcd", "efgh", "ij"]);
  });

  it("parsePdfBuffer resolves with raw text content when pdfParser_dataReady fires", async () => {
    // Capture handlers by event name
    const handlers = new Map<string, Function>();
    onMock.mockImplementation((event: string, cb: Function) => {
      handlers.set(event, cb);
    });

    getRawTextContentMock.mockReturnValue("RAW");

    const promise = parsePdfBuffer(Buffer.from("x"));

    expect(parseBufferMock).toHaveBeenCalledTimes(1);

    // Simulate ready event
    const ready = handlers.get("pdfParser_dataReady");
    expect(typeof ready).toBe("function");
    ready?.();

    await expect(promise).resolves.toBe("RAW");
  });

  it("parsePdfBuffer rejects when pdfParser_dataError fires", async () => {
    const handlers = new Map<string, Function>();
    onMock.mockImplementation((event: string, cb: Function) => {
      handlers.set(event, cb);
    });

    const promise = parsePdfBuffer(Buffer.from("x"));

    const errHandler = handlers.get("pdfParser_dataError");
    expect(typeof errHandler).toBe("function");

    errHandler?.({ parserError: new Error("bad pdf") });

    await expect(promise).rejects.toThrow("bad pdf");
  });
});
