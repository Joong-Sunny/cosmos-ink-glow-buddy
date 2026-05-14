export type Book = {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  keywords: string[];
  registeredAt: string;
  starState: "lit" | "dim";
  /** 0–3, used to determine star brightness tier */
  questionsAnswered?: number;
  /** Indices into `keywords` that the user already answered. */
  answeredKeywordIndices?: number[];
};

export type QuestionLevel = "L1" | "L2" | "L3" | "L4" | "L5";

export type QuestionCategory =
  | "factCheck"
  | "plot"
  | "inference"
  | "critical"
  | "meta";

export type Question = {
  id: string;
  bookId: string;
  level: QuestionLevel;
  text: string;
  category: QuestionCategory;
};

export type ThreadTurn = {
  id: string;
  bookId: string;
  question: Question;
  answer: string;
  createdAt: string;
};

export type ArcanumType = "seeker" | "doubt" | "starAlight";

export type WorldviewCard = {
  id: string;
  romanNumeral: "I" | "II" | "III" | "IV" | "V";
  nameKr: string;
  nameEn: string;
  arcanumType: ArcanumType;
  quote: string;
  booksCount: number;
  starsCount: number;
  issuedAt: string;
  relatedKeyword: string;
  relatedBookIds: string[];
};

export type Constellation = {
  keyword: string;
  bookIds: string[];
  centerBookId: string;
};

export type StarPosition = { x: number; y: number };
