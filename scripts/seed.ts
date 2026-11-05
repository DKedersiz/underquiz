import { db } from "@/db";
import { saveResult, type NewAnswer, type NewResult } from "@/db/results";

const javaResult: NewResult = {
  id: "c18f3a8b-3e5b-4c22-92a1-5fbb77f6b8b1",
  topicId: "java-oop",
  contentKey:
    "java-oop.oop-basics.override-dispatch@1|java-oop.exceptions.checked-vs-unchecked@1|java-oop.immutability.getter-leak@1|java-oop.collections-streams.lazy-filter@1|java-oop.equality-hashing.mutable-key@1|java-oop.concurrency.chm-compound-update@1",
  level: 0,
  levelScores: [
    { level: 1, earned: 1, max: 2, passed: false },
    { level: 2, earned: 1, max: 2, passed: false },
    { level: 3, earned: 1, max: 2, passed: false },
    { level: 4, earned: 0, max: 0, passed: false },
  ],
  subtopicScores: [
    { id: "oop-basics", earned: 0, max: 1 },
    { id: "equality-hashing", earned: 0, max: 1 },
    { id: "immutability", earned: 0, max: 1 },
    { id: "collections-streams", earned: 1, max: 1 },
    { id: "exceptions", earned: 1, max: 1 },
    { id: "concurrency", earned: 1, max: 1 },
  ],
  completedAt: new Date("2026-11-01T10:00:00Z"),
};

const sqlResult: NewResult = {
  id: "e4a2c918-7f94-4b51-8933-28b9d885f403",
  topicId: "sql",
  contentKey:
    "sql.keys-constraints.fk-one-to-many@1|sql.aggregation.ungrouped-column@1|sql.keys-constraints.check-vs-unique@1|sql.schema-design.timestamp-vs-timestamptz@1|sql.indexing.composite-leading-column@1|sql.indexing.low-selectivity-seq-scan@1|sql.transactions.lost-update-counter@1|sql.schema-design.jsonb-vs-table-analytics@1",
  level: 4,
  levelScores: [
    { level: 1, earned: 2, max: 2, passed: true },
    { level: 2, earned: 2, max: 2, passed: true },
    { level: 3, earned: 2, max: 3, passed: true },
    { level: 4, earned: 1, max: 1, passed: true },
  ],
  subtopicScores: [
    { id: "keys-constraints", earned: 2, max: 2 },
    { id: "schema-design", earned: 2, max: 2 },
    { id: "aggregation", earned: 1, max: 1 },
    { id: "indexing", earned: 2, max: 2 },
    { id: "transactions", earned: 0, max: 1 },
  ],
  completedAt: new Date("2026-11-02T10:00:00Z"),
};

const javaAnswers: NewAnswer[] = [
  {
    id: "9b3d0a21-1f48-4394-a134-2e9095697621",
    questionId: "java-oop.collections-streams.lazy-filter",
    questionType: "mc",
    optionId: "a",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "f83a6b57-37d4-4bb7-b4d2-d61994689b14",
    questionId: "java-oop.concurrency.chm-compound-update",
    questionType: "mc",
    optionId: "b",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "5cb9a544-7832-4742-99bb-9276d1e44f1c",
    questionId: "java-oop.equality-hashing.mutable-key",
    questionType: "mc",
    optionId: "d",
    openAnswer: null,
    credit: 0.0,
  },
  {
    id: "2dcefb45-668b-4940-bfae-f63b4685ffcb",
    questionId: "java-oop.exceptions.checked-vs-unchecked",
    questionType: "mc",
    optionId: "d",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "898fa358-1d93-4a1d-a94f-561b36585149",
    questionId: "java-oop.immutability.getter-leak",
    questionType: "mc",
    optionId: "b",
    openAnswer: null,
    credit: 0.0,
  },
  {
    id: "721a7114-1fce-4c17-8e6d-74d4719b9c9f",
    questionId: "java-oop.oop-basics.override-dispatch",
    questionType: "mc",
    optionId: "c",
    openAnswer: null,
    credit: 0.0,
  },
];

const sqlAnswers: NewAnswer[] = [
  {
    id: "3a6e92ef-8d69-4f76-88cf-96d5b00cb44f",
    questionId: "sql.aggregation.ungrouped-column",
    questionType: "mc",
    optionId: "c",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "8c35fd16-d34e-4fbf-97f2-a9b0c74bce71",
    questionId: "sql.indexing.composite-leading-column",
    questionType: "mc",
    optionId: "a",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "6e246be5-3a05-4f40-974a-cf0eb3ec8027",
    questionId: "sql.indexing.low-selectivity-seq-scan",
    questionType: "mc",
    optionId: "a",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "b5437812-7013-4318-9177-33ee665f2a1b",
    questionId: "sql.keys-constraints.check-vs-unique",
    questionType: "mc",
    optionId: "b",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "de350e93-27c5-4a64-9a4f-ea515d9a9415",
    questionId: "sql.keys-constraints.fk-one-to-many",
    questionType: "mc",
    optionId: "b",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "46fe1e60-6447-4e7a-9db1-b210fbf48a90",
    questionId: "sql.schema-design.jsonb-vs-table-analytics",
    questionType: "mc",
    optionId: "a",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "fa327c50-b087-43ca-9828-5e839e4e69ce",
    questionId: "sql.schema-design.timestamp-vs-timestamptz",
    questionType: "mc",
    optionId: "b",
    openAnswer: null,
    credit: 1.0,
  },
  {
    id: "5b5ec1e9-5369-4e09-9fc6-9467664dc174",
    questionId: "sql.transactions.lost-update-counter",
    questionType: "mc",
    optionId: "b",
    openAnswer: null,
    credit: 0.0,
  },
];

async function seed() {
  const host = new URL(process.env.DATABASE_URL || "").hostname;

  if (!["localhost", "127.0.0.1"].includes(host)) {
    throw new Error(`Seed can only be run in local environment! Target: ${host}`);
  }

  await saveResult(javaResult, javaAnswers);
  await saveResult(sqlResult, sqlAnswers);

  await db.$client.end();

}

seed();
