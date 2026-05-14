import booksCsvRaw from "../../books.csv?raw";
import { CATEGORIES, isCategory, type Category } from "./categories";

export type CsvBook = {
  /** Stable id derived from title (kebab/hash). */
  id: string;
  title: string;
  author: string;
  /** Only the categories that match the 11 canonical ones. */
  categories: Category[];
  description: string;
};

/**
 * Minimal RFC-4180 CSV parser that handles:
 *  - quoted fields
 *  - commas inside quoted fields
 *  - escaped quotes ("")
 *  - CR/LF line endings
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      // ignore — \n will close
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  // flush
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function slugify(input: string, salt: number): string {
  // Korean-safe id: keep visible chars, prefix with index so duplicates don't collide
  const cleaned = input.replace(/\s+/g, "-").slice(0, 24);
  return `csv-${salt}-${cleaned}`;
}

function parseCategoriesField(raw: string): Category[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => isCategory(s)) as Category[];
}

let cache: CsvBook[] | null = null;
let titleIndex: Map<string, CsvBook> | null = null;

/** Parse books.csv once, then return the memoised array. */
export function getAllBooks(): CsvBook[] {
  if (cache) return cache;
  const rows = parseCsv(booksCsvRaw);
  const [header, ...body] = rows;
  // Sanity-check header but don't fail the build if it shifts
  const titleIdx = header.findIndex((h) => h.trim() === "도서명");
  const authorIdx = header.findIndex((h) => h.trim() === "저자");
  const catIdx = header.findIndex((h) => h.trim() === "카테고리");
  const descIdx = header.findIndex((h) => h.trim() === "내용");

  const out: CsvBook[] = [];
  for (let i = 0; i < body.length; i++) {
    const r = body[i];
    if (!r || r.length === 0) continue;
    const title = (r[titleIdx] ?? "").trim();
    if (!title) continue;
    const author = (r[authorIdx] ?? "").trim();
    const categories = parseCategoriesField(r[catIdx] ?? "");
    const description = (r[descIdx] ?? "").trim();
    out.push({
      id: slugify(title, i),
      title,
      author,
      categories,
      description,
    });
  }
  cache = out;
  return cache;
}

function getTitleIndex(): Map<string, CsvBook> {
  if (titleIndex) return titleIndex;
  const m = new Map<string, CsvBook>();
  for (const b of getAllBooks()) m.set(b.title, b);
  titleIndex = m;
  return m;
}

/** Lookup by exact title. */
export function findBookByTitle(title: string): CsvBook | undefined {
  return getTitleIndex().get(title);
}

/** Lookup by csv id. */
export function findBookById(id: string): CsvBook | undefined {
  return getAllBooks().find((b) => b.id === id);
}

/**
 * Substring search over title & author.
 * Returns at most `limit` matches, prioritising title prefix matches.
 */
export function searchBooks(query: string, limit = 40): CsvBook[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = getAllBooks();
  const prefix: CsvBook[] = [];
  const contains: CsvBook[] = [];
  const author: CsvBook[] = [];

  for (const b of all) {
    const t = b.title.toLowerCase();
    if (t.startsWith(q)) {
      prefix.push(b);
    } else if (t.includes(q)) {
      contains.push(b);
    } else if (b.author.toLowerCase().includes(q)) {
      author.push(b);
    }
    if (prefix.length + contains.length + author.length >= limit * 3) break;
  }
  return [...prefix, ...contains, ...author].slice(0, limit);
}

export { CATEGORIES };
