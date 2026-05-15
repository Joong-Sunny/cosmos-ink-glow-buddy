import type { Book, Constellation, StarPosition, ThreadTurn, WorldviewCard } from "./types";
import { CATEGORIES, type Category, coverColorFor } from "./categories";
import { findBookByTitle } from "./book-database";

/**
 * Demo seed
 * =========
 * Every star on the home universe represents a book the demo user has
 * already finished reading AND already answered question(s) for. There
 * are NO unread / partially-read books in the seed — that simplification
 * matches the product story: "별 = 독후감 활동을 마친 책".
 *
 * The demo book "동물농장" is *deliberately* NOT seeded. The user adds
 * it during the live demo via the register modal, which is what makes the
 * "your new star joins the constellation" moment feel earned.
 */

// Deterministic PRNG (mulberry32) for stable star coordinates
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type SeedSpec = {
  id: string;
  /** CSV title — used to look up author + categories from books.csv */
  title: string;
  fallbackAuthor?: string;
  fallbackCategories?: Category[];
  coverColor?: string;
};

const SEED_SPECS: SeedSpec[] = [
  // The demo's "권력 별자리" already-read members. These must be present so
  // the new 동물농장 star has somewhere to connect.
  { id: "b1984", title: "1984" },
  { id: "bgiver", title: "기억 전달자" },
  { id: "b11", title: "우리들의 일그러진 영웅" },
  { id: "bmocking", title: "앵무새 죽이기 (청소년)" },
  { id: "bsuho", title: "수호의 파수꾼" },
  // Books referenced inside the demo's follow-up questions — must be in the
  // seed so the audience can click them and see the past answer.
  { id: "b06", title: "어린 왕자" },
  { id: "b23", title: "정의란 무엇인가 (어린이)" },
  // Background population — variety of categories.
  { id: "b02", title: "긴긴밤" },
  { id: "b03", title: "자전거 도둑" },
  { id: "b04", title: "마당을 나온 암탉" },
  { id: "b05", title: "열두 살에 부자가 된 키라" },
  { id: "b07", title: "초정리 편지" },
  { id: "b08", title: "괭이부리말 아이들" },
  { id: "b09", title: "샬롯의 거미줄" },
  { id: "b10", title: "5번 레인" },
  { id: "b12", title: "소나기" },
  { id: "b13", title: "비밀의 화원" },
  { id: "b14", title: "아몬드" },
  { id: "b15", title: "창가의 토토" },
  { id: "b16", title: "삼국유사" },
  { id: "b17", title: "종의 기원 (어린이용)" },
  { id: "b18", title: "목민심서 (어린이용)" },
  { id: "b19", title: "열하일기 (어린이용)" },
  { id: "b20", title: "톨스토이 단편선" },
  { id: "b21", title: "이상한 나라의 앨리스" },
  { id: "b22", title: "처음 읽는 삼국지" },
  { id: "b24", title: "연금술사" },
  { id: "b25", title: "침묵의 봄 (어린이용)" },
  { id: "b26", title: "사자와 마녀와 옷장" },
  { id: "b27", title: "난중일기 (어린이용)" },
  { id: "b28", title: "행복한 청소부" },
  { id: "b29", title: "강아지똥" },
  { id: "b30", title: "몽실 언니" },
  { id: "b31", title: "너도 하늘말나리야" },
  { id: "b32", title: "책과 노니는 집" },
  { id: "b33", title: "양반전" },
  { id: "b34", title: "허생전" },
  { id: "b35", title: "독 짓는 늙은이" },
  { id: "b36", title: "수난이대" },
  { id: "b37", title: "후추의 안개 공장" },
  { id: "b38", title: "알로하 나의 엄마들" },
];

function resolveSeed(spec: SeedSpec): {
  id: string;
  title: string;
  author: string;
  keywords: Category[];
  coverColor: string;
} {
  const csv = findBookByTitle(spec.title);
  const author = csv?.author ?? spec.fallbackAuthor ?? "작자 미상";
  const keywords = csv?.categories?.length
    ? csv.categories
    : spec.fallbackCategories ?? [];
  const coverColor = spec.coverColor ?? coverColorFor(keywords);
  return {
    id: spec.id,
    title: spec.title,
    author,
    keywords,
    coverColor,
  };
}

export function generateStarPositions(books: { id: string }[]): Record<string, StarPosition> {
  const rng = mulberry32(20260514);
  const out: Record<string, StarPosition> = {};
  for (const b of books) {
    out[b.id] = {
      x: 0.08 + rng() * 0.84,
      y: 0.12 + rng() * 0.76,
    };
  }
  return out;
}

const NOW = new Date("2026-05-15T10:00:00.000Z").getTime();

const RESOLVED = SEED_SPECS.map(resolveSeed);

/**
 * Every seeded book is "fully read" — every keyword answered.
 * This matches the product story and lets the home universe show only
 * one kind of star ("read"), with no dim / partial visuals to manage.
 */
export const SEED_BOOKS: Book[] = RESOLVED.map((b, i) => {
  const answered = Array.from({ length: b.keywords.length }, (_, k) => k);
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    coverColor: b.coverColor,
    keywords: b.keywords,
    starState: "lit" as const,
    answeredKeywordIndices: answered,
    questionsAnswered: answered.length,
    registeredAt: new Date(NOW - (RESOLVED.length - i) * 86400000).toISOString(),
  };
});

export const SEED_STAR_POSITIONS = generateStarPositions(SEED_BOOKS);

export const SEED_KEYWORDS = CATEGORIES;

export const SEED_CONSTELLATIONS: Constellation[] = CATEGORIES.map((keyword) => {
  const matches = SEED_BOOKS.filter((b) => b.keywords.includes(keyword));
  return {
    keyword,
    bookIds: matches.map((b) => b.id),
    centerBookId: matches[matches.length - 1]?.id ?? matches[0]?.id ?? "",
  };
});

// ─── Past answers — the threads shown when a seed star is clicked ────
//
// Hand-written for books referenced inside the demo follow-up questions
// (so the "you previously wrote about this" feel is real), plus a few
// extras. Anything not listed here gets a templated fallback.
//
// Tone target: thoughtful 5th-grader, casual.
type ByKeyword = Partial<Record<Category, string>>;

const HAND_WRITTEN: Record<string, ByKeyword> = {
  "우리들의 일그러진 영웅": {
    "권력":
      "엄석대가 처음 나왔을 때는 무섭다기보단 신기했다. 그런데 한병태가 손을 들었는데 아무도 같이 안 들어주는 그 장면이 진짜 무서웠다. 무서운 건 엄석대가 아니라 다른 애들의 침묵이었던 것 같다. 우리 반에도 가끔 그런 순간이 있다. 누가 분명히 잘못한 건데 다들 가만히 있는 순간.",
    "철학":
      "한병태가 결국 엄석대를 인정하게 된 게 슬펐다. 옳다고 믿었는데 너무 외로워서 그만둔 거 같다. 그러니까 옳음만 있어선 안 되고, 같이 옳은 걸 봐주는 사람이 옆에 있어야 하는 것 같다. 혼자 옳기는 너무 어렵다.",
  },
  "1984": {
    "권력":
      "빅 브라더는 한 번도 안 나오는데 모두가 그 사람을 무서워한다. 그게 진짜 무서운 부분 같다. 누가 진짜로 보고 있는 건지 모르니까 다들 알아서 조심한다. 우리도 CCTV가 진짜 켜져 있든 아니든 켜져 있다고 생각하면 행동이 달라진다. 윈스턴이 마지막에 빅 브라더를 사랑하게 됐다는 게 제일 마음이 아팠다.",
    "철학":
      "'전쟁은 평화다' 같은 말이 처음엔 그냥 말장난 같았다. 그런데 어른들이 '다 너희 잘되라고 하는 거야'라고 할 때랑 좀 비슷한 느낌이 들었다. 말이 거꾸로 가도 자꾸 들으면 그게 맞는 것 같아진다. 그래서 누가 같은 말을 자꾸 하면 한 번쯤 의심해봐야 할 것 같다.",
  },
  "어린 왕자": {
    "철학":
      "어른들은 숫자를 좋아한다고 한 부분이 제일 기억에 남는다. '저 집 얼마야?'라고 묻는 어른들. 나도 어떤 책이 재밌었는지보다 몇 점이었는지부터 말할 때가 있다. 어린 왕자는 그게 슬펐던 거 같다. 진짜 중요한 건 눈으로 안 보인다는 말이 계속 머릿속에 남았다.",
    "희생":
      "여우가 길들이는 것에 대해 말한 게 좋았다. 그냥 친구가 되는 게 아니라 시간을 들여서 서로한테 특별해지는 거. 우리 강아지도 처음엔 그냥 강아지였는데 지금은 '내 강아지'다. 친구도 자주 보고 같이 시간을 보내야 진짜 친구가 되는 것 같다.",
  },
  "정의란 무엇인가 (어린이)": {
    "권력":
      "여러 사람의 입장이 다 한 번씩 옳아 보였다. 그게 제일 헷갈렸다. 그래서 정의는 한 가지 답이 아니라 자꾸 묻는 거구나, 그런 생각을 했다. 내가 옳다고 우기기보다 한 번 더 들어보는 게 정의에 가까운 것 같다.",
    "철학":
      "내가 옳다고 생각하는 것도 누군가에겐 틀린 거라는 걸 알게 됐다. 그러면 무조건 우기지 말고 일단 들어보는 게 먼저인 것 같다. 어른들도 자기 의견이 다 맞는 건 아닌 게 좀 충격이었다.",
  },
  "기억 전달자": {
    "권력":
      "다 같이 똑같이 사는 마을이 처음엔 평화로워 보였는데, 색깔도 없고 슬픔도 없는 게 진짜 평화는 아니었던 것 같다. 안전하려고 너무 많은 걸 포기한 사회처럼 보였다.",
    "철학":
      "고통이 없으면 행복도 없다는 게 이상하게 들렸지만 책을 다 읽고는 이해가 됐다. 모든 게 똑같으면 좋아하는 것도 없어지니까. 다른 게 있어야 좋아하는 것도 생기는 거 같다.",
    "성장":
      "조너스가 새 색을 처음 본 장면이 좋았다. 우리도 모르고 살아온 것들이 분명히 있을 거고, 그걸 처음 본 날의 충격이 자라는 거구나 싶었다.",
  },
  "앵무새 죽이기 (청소년)": {
    "권력":
      "애티커스가 진다는 걸 알면서도 끝까지 변호한 게 멋있었다. 이길 수 없어도 옳은 일은 해야 한다는 거. 스카웃이 그걸 보고 자라는 게 진짜 교육 같다고 생각했다.",
    "용기":
      "총을 잘 쏘는 걸 자랑하지 않는 애티커스가 진짜 멋있었다. 강한 사람일수록 자랑 안 한다는 게 인상 깊었다. 진짜 용기는 큰 소리가 아니라 조용히 한 발 나아가는 거 같다.",
    "사랑":
      "다른 사람 입장에 서서 걸어보지 않으면 그 사람을 알 수 없다는 말이 기억에 남는다. 학교에서도 가끔 친구가 왜 그러는지 짜증부터 났는데, 한 번 더 생각해봐야겠다.",
  },
  "수호의 파수꾼": {
    "성장":
      "월이 자기가 누구인지 찾아가는 과정이 좀 슬프면서 멋있었다. 모르고 살았던 진실을 알게 되는 게 자라는 거랑 비슷한 거 같다.",
    "권력":
      "언어로 누군가를 차별할 수 있다는 게 무서웠다. 말 한마디가 칼이 될 수 있다는 걸 다시 느꼈다. 내가 친구한테 무심코 한 말도 그랬을지 모른다.",
    "사랑":
      "다르다는 이유로 멀어지는 게 우주 콜로니에서도 똑같이 일어난다는 게 신기했다. 사람이 사는 곳이면 다 비슷한 문제가 있는 것 같다.",
  },
  "몽실 언니": {
    "희생":
      "몽실이가 동생들을 끝까지 책임지는 게 대단했다. 나는 동생이 한 명 있는데도 가끔 짜증 내는데, 몽실이는 진짜 엄마처럼 자기 동생들을 챙겼다.",
    "권력":
      "전쟁이 끝났는데도 사람들이 계속 가난하고 힘든 게 이상했다. 전쟁이 한 번 일어나면 끝나도 끝난 게 아니라는 걸 알았다.",
    "사랑":
      "다리가 불편해도 몽실이는 안 멈췄다. 다르다는 게 못 한다는 뜻이 아니라는 걸 보여준 인물 같다.",
  },
  "자전거 도둑": {
    "성장":
      "수남이가 끝까지 도덕적이려고 하는 게 멋있었지만 너무 외로워 보이기도 했다. 옳은 일을 하는 게 항상 보상받는 건 아니라는 걸 처음 알았다.",
    "권력":
      "어른들이 다 같이 거짓말을 시킬 때 수남이가 흔들리는 게 진짜 무서웠다. 분위기가 옳은 걸 이길 수도 있다는 게 충격이었다.",
    "희생":
      "아버지 생각이 자꾸 떠올라서 수남이가 결국 시골로 돌아간 게 좋았다. 옳은 마음을 지켜주는 사람이 가족인 거 같다.",
  },
  "긴긴밤": {
    "성장":
      "노든 할아버지가 치쿠한테 해준 이야기들이 진짜 좋았다. 누가 옆에 있어주는 것만으로도 자랄 수 있구나 싶었다.",
    "희생":
      "피로 안 이어진 가족도 가족이 될 수 있다는 게 좋았다. 종이 다른 두 동물이 진짜 가족이 됐다.",
    "철학":
      "이름을 받는다는 게 별 거 아닌 것 같았는데, 책을 다 읽고는 진짜 큰일이었다는 걸 알았다. 누군가 나를 불러주는 게 존재의 시작인 거 같다.",
  },
  "아몬드": {
    "사랑":
      "윤재가 감정을 못 느낀다고 해서 마음이 없는 건 아니었다. 표현 방식이 다른 것뿐이라는 걸 곤이를 통해 배웠다.",
    "희생":
      "할머니랑 엄마가 윤재한테 감정을 가르치려고 한 방식이 따뜻했다. 사랑이 가르쳐지는 거구나 싶었다.",
  },
};

// Light templates for keywords — picked deterministically by book id so
// the same book always shows the same past answer (refreshes idempotent).
const KEYWORD_TEMPLATES: Partial<Record<Category, string[]>> = {
  "성장": [
    "주인공이 처음보다 한 발짝 자란 게 느껴졌다. 나도 작년의 나랑 지금의 나를 비교하면 비슷한 부분이 있는 것 같다.",
    "어려운 순간을 지나면서 사람이 변하는 게 보였다. 자라는 건 갑자기 되는 게 아니라 조금씩 쌓이는 거 같다.",
    "주인공이 마지막에 한 선택이 처음의 그 사람으로는 못 했을 선택이었다. 그래서 진짜로 컸다고 느꼈다.",
  ],
  "희생": [
    "친구가 된다는 게 뭔지 다시 생각하게 됐다. 그냥 같이 노는 게 아니라 서로한테 특별해지는 거구나 싶었다.",
    "가족이라는 게 꼭 피로 이어진 사람만 말하는 건 아닐 수도 있겠다는 생각이 들었다.",
    "옆에 있어주는 것만으로도 누군가에게 큰 힘이 된다는 걸 알게 됐다.",
  ],
  "권력": [
    "사람들이 왜 가만히 있을까에 대해 생각해봤다. 누구 하나라도 '이상해'라고 말하면 달라질 수 있을 텐데, 그게 어려워 보였다.",
    "옳은 일을 한다는 게 인기를 얻는 거랑은 다른 거구나 싶었다. 외로워도 끝까지 가는 사람이 결국 뭔가를 바꾸는 것 같다.",
    "법이 있어도 사람들이 그걸 안 지키면 소용이 없다. 결국은 사람의 마음이 중요한 거 같다.",
  ],
  "철학": [
    "당연하다고 생각했던 것이 실은 당연하지 않았다는 걸 알게 됐다. 자꾸 묻는 게 어른이 되는 거 같다.",
    "정답이 한 개가 아닐 수도 있다는 게 충격이었다. 그래서 책은 같이 읽고 얘기해야 더 좋은 것 같다.",
    "보이는 게 다가 아니다, 라는 말이 진짜 그런 뜻이었구나 싶었다.",
  ],
  "자유": [
    "이런 세계가 진짜로 있다면 어떨까 상상하게 됐다. 책을 덮고 한참 천장을 봤다.",
    "현실에서 일어날 수 없는 일이 일어나서 오히려 현실의 문제를 더 잘 보여주는 것 같다.",
    "상상은 도망치는 게 아니라 새로운 가능성을 보는 거라는 생각이 들었다.",
  ],
  "사랑": [
    "나랑 다른 사람의 마음을 헤아리는 게 진짜 어렵다는 걸 느꼈다. 그래도 노력해야 한다고 생각한다.",
    "다르다는 게 틀린 게 아니라는 걸 한 번 더 배웠다. 사실 다 알면서도 자꾸 까먹는다.",
    "한 번 더 생각하면 보이는 게 있다. 짜증부터 내지 말고 멈춰서 봐야겠다.",
  ],
  "용기": [
    "주인공이 무서웠을 텐데도 한 발 나간 게 멋있었다. 나도 다음에 그런 순간이 오면 도망가지 않고 싶다.",
    "진짜 용기는 큰소리치는 게 아니라 조용히 옳은 걸 하는 거 같다.",
    "리더가 된다는 건 위에 서는 게 아니라 옆에서 같이 가는 거였다.",
  ],
  "역사": [
    "옛날 사람들도 우리랑 똑같이 화나고 슬프고 그랬다는 게 신기했다. 시대만 다르지 마음은 비슷한가 보다.",
    "지금의 우리가 그냥 생긴 게 아니라 누군가가 그렇게 만들어준 거구나 싶었다.",
    "지나간 일을 알면 지금이 다르게 보인다는 게 신기했다.",
  ],
  "과학·자연": [
    "자연이 우리한테 말을 거는 것 같았다. 우리가 자연을 너무 막 대했나, 그런 생각이 들었다.",
    "당연한 줄 알았던 자연이 사실은 엄청 정교하게 짜여 있다는 게 놀라웠다.",
    "과학은 외우는 게 아니라 궁금해하는 거구나 싶었다.",
  ],
  "예술": [
    "잘 그리고 잘 쓰는 게 중요한 줄 알았는데 진짜는 마음을 보여주는 거였다.",
    "한 사람의 마음이 다른 사람한테 전해질 수 있다는 게 예술이 하는 일인 것 같다.",
    "기술보다 진심이 먼저라는 걸 알게 됐다.",
  ],
  "경제": [
    "돈은 그냥 종이인 것 같은데 사람들이 이렇게 많이 움직이는 게 신기했다.",
    "사람의 선택이 모이면 거대한 흐름이 된다는 게 인상 깊었다.",
    "가지는 것보다 어떻게 쓰느냐가 더 중요한 것 같다.",
  ],
};

function pickTemplate(book: Book, keyword: string): string {
  const list = (KEYWORD_TEMPLATES as Record<string, string[] | undefined>)[keyword];
  if (!list || list.length === 0) {
    return `${book.title}을(를) 읽고 ${keyword}에 대해 생각이 많아졌다.`;
  }
  // Stable hash from book.id so each book always gets the same template
  let h = 0;
  for (let i = 0; i < book.id.length; i++) h = (h * 31 + book.id.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

function pastAnswerFor(book: Book, keyword: string): string {
  const byTitle = HAND_WRITTEN[book.title] as Record<string, string> | undefined;
  return byTitle?.[keyword] ?? pickTemplate(book, keyword);
}

/**
 * One thread entry per seed book × answered keyword. BookDetailPanel's
 * "내 답변 보기" reads these via `threads.filter(t => t.bookId === ... &&
 * t.question.id.startsWith(`${bookId}:k${idx}`))`.
 */
export const SEED_THREADS: ThreadTurn[] = SEED_BOOKS.flatMap((book) =>
  (book.answeredKeywordIndices ?? []).flatMap((kwIdx, n) => {
    const keyword = book.keywords[kwIdx];
    if (!keyword) return [];
    return [
      {
        id: `${book.id}:k${kwIdx}:seed`,
        bookId: book.id,
        question: {
          id: `${book.id}:k${kwIdx}`,
          bookId: book.id,
          level: "L3" as const,
          text: "",
          category: "inference" as const,
        },
        answer: pastAnswerFor(book, keyword),
        createdAt: new Date(NOW - (SEED_BOOKS.length - n) * 86400000).toISOString(),
      },
    ];
  }),
);

/** "권력" 카테고리의 대표 4권. */
const JUSTICE_BOOK_IDS = SEED_BOOKS.filter((b) =>
  b.keywords.includes("권력"),
)
  .slice(0, 4)
  .map((b) => b.id);

/** "철학" 카테고리의 대표 4권. */
const PHILOSOPHY_BOOK_IDS = SEED_BOOKS.filter((b) => b.keywords.includes("철학"))
  .slice(0, 4)
  .map((b) => b.id);

export const SEED_WORLDVIEW_CARDS: WorldviewCard[] = [
  {
    id: "wc-i",
    romanNumeral: "I",
    nameKr: "정의를 묻는 자",
    nameEn: "THE SEEKER",
    arcanumType: "seeker",
    quote: "공정함은 결과가 아니라 누가 끝까지 묻느냐의 문제다.",
    booksCount: JUSTICE_BOOK_IDS.length,
    starsCount: JUSTICE_BOOK_IDS.length * 2,
    issuedAt: new Date(NOW - 7 * 86400000).toISOString(),
    relatedKeyword: "권력",
    relatedBookIds: JUSTICE_BOOK_IDS,
  },
  {
    id: "wc-ii",
    romanNumeral: "II",
    nameKr: "자라난 의심",
    nameEn: "THE DOUBT",
    arcanumType: "doubt",
    quote: "나를 가장 모르는 사람은 나일 때가 많다.",
    booksCount: PHILOSOPHY_BOOK_IDS.length,
    starsCount: PHILOSOPHY_BOOK_IDS.length * 2 + 2,
    issuedAt: new Date(NOW - 2 * 86400000).toISOString(),
    relatedKeyword: "철학",
    relatedBookIds: PHILOSOPHY_BOOK_IDS,
  },
];
