export const formatScore = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");