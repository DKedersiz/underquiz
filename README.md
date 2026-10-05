# underquiz

A level assessment for junior back-end developers. Instead of a single score, it tells you which level
you are at in each topic (Spring Core, JPA & Transaction) and what to study next.

## How it works

- Questions go from level 1 to 4: **1 · knows what it is**, **2 · uses it correctly**,
  **3 · knows how it works**, **4 · weighs trade-offs** (strong junior).
- Multiple-choice questions have no trick answers: every wrong option maps to a real misconception, which is
  shown on the results page ("your choice suggests you think X").
- Open questions are self-assessed in v1: after answering, the user ticks which rubric points their answer
  covers and the score is computed in code. LLM-based grading is planned for a later version.
- A level is passed with at least 60% of its points; the topic level is the highest level for which it and
  every level below are passed (`src/lib/quiz/scoring.ts`).

## Content

Questions live in `content/` as YAML and are validated with Zod (`src/lib/content/schema.ts`). Only questions
with `review.status: reviewed` are published. Two questions linked by `revealsAnswerOf` are never asked
together. Question text is Turkish; markdown and code blocks are rendered at build time with Shiki.

## Development

### Running Locally

Tools needed:

- Node.js -> version greater than 22+

```bash
npm install -> to install all the dependencies from the package.json
npm run dev -> to start an development server     # http://localhost:3000
npm test -> to do all the necessary tests on this application, also checks if any of the content file is good to go
        # scoring rules + validation of every content file
npm run build -> to have an production-ready build
```

Stack: Next.js (App Router, static pages), TypeScript, Tailwind CSS, Zod, Vitest. No accounts, no database;
progress is kept in the browser's localStorage.
