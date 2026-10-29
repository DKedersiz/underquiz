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

- Node.js 22 or later

```bash
npm install # to install all the dependencies listed in the package.json
npm run dev # to start a development server     # http://localhost:3000
npm test # to do all the necessary tests on this application, also checks if any of the content file is good to go. scoring rules + validation of every content file
npm run build # to have a production-ready build
```

`npm install` will show you 5 high-severity warnings. Do not run the `npm audit fix --force` command because it will force eslint-config-next to lower its version to an old one. All warnings originate from the linting tool used exclusively during development. `npm audit --omit=dev` reports zero vulnerabilities in production dependencies.

Stack: Next.js (App Router, static pages), TypeScript, Tailwind CSS, Zod, Vitest, PostgreSQL, Drizzle.
No accounts yet; progress is still kept in localStorage, the database is not connected to the app yet.

### Local Database

After completing the "Running Locally" step, to get up and running with the database, first you need to create the ".env" file, to create this file you need to copy the ".env.example" file and fill in the required values with your own password, port, username and postgresql url.

Please don't forget to change the value in the url with the password you chose. Otherwise you could get authentication failed error.

Next you have to run our docker-compose.yml file, for this you need to have Docker Desktop installed on your computer, if you do have Docker Desktop all you have to do is run the command below.

```bash
docker compose up -d
``` 

Once the database is running, apply the migrations to create the database tables.

```bash 
npx drizzle-kit migrate
```

Afterward to see if you did create the tables in the database run: 

```bash 
docker compose exec db psql -U underquiz -d underquiz
```

Once connected, list the tables by running:

```psql
\dt
```

You should see tables such as answers and results in the output.

The drizzle/ directory is committed to the repository because it contains the generated migration files needed to reproduce database schema changes across different environments.

When you change the database schema in schema.ts, generate a new migration by running:

```bash
npx drizzle-kit generate
```

Commit the updated schema and the generated migration files in drizzle/ so that other developers and deployment environments can apply the same changes using npx drizzle-kit migrate.
