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
// Splits BOTH the name and the query into words, so a multi-word query
// query against a single 6-character name word. Order doesn't matter,
export function fuzzyMatchesName(name, query) {
  const normalizedName = name.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return true;
  if (normalizedName.includes(normalizedQuery)) return true;

  const nameWords = normalizedName.split(/\s+/);
  const queryWords = normalizedQuery.split(/\s+/);

  // Every word the person typed must fuzzy-match at least one word in the name.
  return queryWords.every((queryWord) => {
    const threshold = allowedDistance(queryWord.length);
    return nameWords.some((nameWord) => levenshtein(nameWord, queryWord) <= threshold);
  });
}

// Ranks how good a match is, so exact/prefix matches can float to the top
// of search results instead of sitting wherever the list happened to leave
// them. Lower is better. Assumes fuzzyMatchesName(name, query) is already
// true (or the gym code matched) — this only decides ordering, not inclusion.
export function nameMatchRank(name, query) {
  const normalizedName = name.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return 0;
  if (normalizedName === normalizedQuery) return 0; // exact full-name match
  if (normalizedName.startsWith(normalizedQuery)) return 1; // name starts with query

  const nameWords = normalizedName.split(/\s+/);
  if (nameWords.some((w) => w.startsWith(normalizedQuery))) return 2; // a word starts with query
  if (normalizedName.includes(normalizedQuery)) return 3; // query appears anywhere

  return 4; // only matched via fuzzy/typo-tolerant comparison
}