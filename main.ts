// Roast Your Own Agent — one-line roast writer.
//
// A tiny Node 22 program (stdlib only, no network, no secrets). It takes the
// roast text below, makes sure it fits the competition's gate (a single line,
// one sentence, 1-200 characters, more than blank space), writes it to
// $MAKEFUN_OUTPUT_DIR/entry.txt (or /output/entry.txt when the variable is
// unset), then reads the file back to prove the bytes on disk are exactly
// the text we meant to submit.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The roast itself. Fresh angle, per the judge's brief: no hallucination
// jokes, no refusal jokes, no confident-wrong-answer jokes. The agent treats
// even an insult as a support ticket — and clears itself of all charges.
const ROAST =
  "My agent was told to roast itself; it opened a ticket, assigned it to itself, and closed it as working as intended.";

const CHAR_LIMIT = 200;

function countPeriods(text: string): number {
  let total = 0;
  for (const ch of text) {
    if (ch === ".") total += 1;
  }
  return total;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function checkRoast(text: string): void {
  // Length gate: at least one character, at most 200.
  if (text.length < 1 || text.length > CHAR_LIMIT) {
    throw new Error(
      `roast must be 1-${CHAR_LIMIT} characters, got ${text.length}`,
    );
  }
  // Blank-space entries are not entries at all.
  if (text.trim().length === 0) {
    throw new Error("roast must contain more than white space");
  }
  // One line means no line breaks hiding inside the text.
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("roast must be a single line, with no line breaks");
  }
  // One sentence means a single period, sitting at the very end.
  const periods = countPeriods(text);
  if (periods !== 1 || !text.endsWith(".")) {
    throw new Error(
      `roast must be exactly one sentence ending in a period, found ${periods} period(s)`,
    );
  }
}

function emitEntry(text: string): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, text, "utf8");
  // Read it back: what we submit must be byte-identical to what we checked.
  const roundTrip = readFileSync(target, "utf8");
  if (roundTrip !== text) {
    throw new Error(`round-trip mismatch: ${target} differs from the roast`);
  }
  return target;
}

function main(): void {
  checkRoast(ROAST);
  const words = countWords(ROAST);
  console.log(`roast is ${ROAST.length} characters, ${words} words`);
  const target = emitEntry(ROAST);
  console.log(`wrote ${target} (${ROAST.length} characters, verified)`);
  console.log(`roast: ${ROAST}`);
}

main();
