// Levenshtein distance: counts the minimum number of single-character edits
// (insert, delete, substitute) needed to turn string `a` into string `b`.
// Example: levenshtein('furkan', 'furqan') = 1 (one letter swapped: k -> q).
// This is the standard algorithm for "how close are these two words" —
// no library needed, it's a small dynamic-programming table.
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // delete
          dp[i][j - 1],     // insert
          dp[i - 1][j - 1]  // substitute
        );
      }
    }
  }

  return dp[m][n];
}

// How many typos to tolerate, scaled to how much the person has typed.
// Short queries need a tight threshold (1-2 letters "wrong" out of 4 is a
// completely different word), longer queries can afford a bit more slack.
function allowedDistance(queryLength) {
  if (queryLength <= 4) return 1;
  if (queryLength <= 8) return 2;
  return 3;
}

// Checks a member's name against a search query, tolerating typos.
// Checks the full name AND each individual word (first name, last name, etc.)
// so "furqan" matches "Furkan Ahmed" even though the typo is only in the
// first word.
export function fuzzyMatchesName(name, query) {
  const normalizedName = name.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (normalizedName.includes(normalizedQuery)) return true;

  const words = normalizedName.split(/\s+/);
  const threshold = allowedDistance(normalizedQuery.length);

  return words.some((word) => levenshtein(word, normalizedQuery) <= threshold);
}

//checks a member's name against a search query, tolerating typos.