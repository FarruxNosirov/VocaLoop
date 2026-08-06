import { Book } from "./book-types";
import { essential1 } from "./books/essential-1";
import { essential2 } from "./books/essential-2";
import { essential3 } from "./books/essential-3";
import { essential4 } from "./books/essential-4";
import { essential5 } from "./books/essential-5";
import { essential6 } from "./books/essential-6";
import { oxfordBasic } from "./books/oxford-basic";
import { oxfordIntermediate } from "./books/oxford-intermediate";
import { oxfordAdvanced } from "./books/oxford-advanced";
import { irregularVerbs } from "./books/irregular-verbs";

export * from "./book-types";

// Kitoblar ro'yxati (yangi kitoblar shu yerga qo'shiladi)
export const BOOKS: Book[] = [
  essential1,
  essential2,
  essential3,
  essential4,
  essential5,
  essential6,
  oxfordBasic,
  oxfordIntermediate,
  oxfordAdvanced,
  irregularVerbs,
];
