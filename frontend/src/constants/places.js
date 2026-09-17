// Seed list of places around Sopore, for the residence-field autocomplete.
// Two sources went into this:
//  1. Public data (Wikipedia/census) for the wider Sopore/Zaingair area and
//     nearby towns — useful for members who live further out.
//  2. An aggregation over existing `residence` values in the members
//     collection, which surfaced places that were missing from (1) — like
//     Krankshivan Colony, New Light Colony, Puthka, Tarzoo, Nigeen Bagh —
//     plus the actual abbreviations/misspellings staff type in practice.
//
// Each entry's `aliases` are abbreviations or variant spellings seen in real
// data that DON'T fuzzy-match the canonical name closely enough on their own
// (e.g. "k colny" vs "Krankshivan Colony" — different letters, not a typo).
// Plain typos (Amarghar -> Amargarh, Serr -> Seer) don't need an alias entry;
// the fuzzy matcher already catches those on its own.
//
// This list is NOT exhaustive. Add to it as new places come up — it's a
// plain array, no build step needed.
export const places = [
  // Sopore town & known localities (confirmed from real member data)
  { name: 'Sopore', aliases: [] },
  { name: 'Naseem Bagh', aliases: ['n bagh', 'n. bagh'] },
  { name: 'Nigeen Bagh', aliases: ['nageen bagh'] },
  { name: 'Badam Bagh', aliases: ['b. bagh', 'b bagh'] },
  { name: 'Krankshivan Colony', aliases: ['k colony', 'k colny', 'k. colony', 'k/colony', 'k/ colny'] },
  { name: 'Khushal Colony', aliases: ['khushaal colony', 'khushaal colny'] },
  { name: 'New Light Colony', aliases: ['new light', 'newlight'] },
  { name: 'Baghi Rehmat', aliases: [] },
  { name: 'Baghi Islam', aliases: [] },
  { name: 'Bypass', aliases: [] },
  { name: 'Chankhan', aliases: [] },
  { name: 'Butpora', aliases: [] },
  { name: 'Ashpeer', aliases: [] },
  { name: 'Tulibal', aliases: [] },
  { name: 'Law College', aliases: [] },
  { name: 'Green Town Sopore', aliases: [] },
  { name: 'Down Town Sopore', aliases: [] },
  { name: 'Noor Bagh', aliases: [] },
  { name: 'Sofi Hamam', aliases: [] },
  { name: 'Seer', aliases: [] },
  { name: 'Puthka', aliases: [] },
  { name: 'Tarzoo', aliases: [] },
  { name: 'Amargarh', aliases: [] },
  { name: 'Warpora', aliases: [] },
  { name: 'Jamia Qadeem', aliases: [] },
  { name: 'Kanth Bagh', aliases: [] },
  { name: 'Arampora', aliases: [] },
  { name: 'Chinkipora', aliases: [] },
  { name: 'Darnambal', aliases: [] },
  { name: 'Adipora', aliases: [] },
  { name: 'Nowpora Kalan', aliases: [] },
  { name: 'Nowpora A', aliases: [] },
  { name: 'Nowpora B', aliases: [] },
  { name: 'Lalad', aliases: [] },
  { name: 'Mazbug', aliases: [] },
  { name: 'Sangrama', aliases: [] },
  { name: 'Seer Jagir', aliases: [] },
  { name: 'Humlina', aliases: [] },
  { name: 'Hatishah', aliases: [] },
  { name: 'Khanqah', aliases: [] },

  // Zaingair belt / villages around Sopore
  { name: 'Bomai', aliases: [] },
  { name: 'Hathlangoo', aliases: [] },
  { name: 'Janwara', aliases: [] },
  { name: 'Malmapanpora', aliases: [] },
  { name: 'Malpora', aliases: [] },
  { name: 'Boyingoo', aliases: [] },
  { name: 'Watlab', aliases: [] },
  { name: 'Tujjar Sharief', aliases: [] },
  { name: 'Logripora', aliases: [] },
  { name: 'Goripora', aliases: [] },
  { name: 'Saidpora', aliases: [] },
  { name: 'Dooru', aliases: [] },
  { name: 'Dangarpora', aliases: [] },
  { name: 'Brath', aliases: [] },
  { name: 'Sempora', aliases: [] },
  { name: 'Wadoora', aliases: [] },
  { name: 'Seelo', aliases: [] },
  { name: 'Zaloora', aliases: [] },
  { name: 'Harwan', aliases: [] },
  { name: 'Unisoo', aliases: [] },
  { name: 'Magraypora', aliases: [] },
  { name: 'Botingoo', aliases: [] },
  { name: 'Dangerpora', aliases: [] },
  { name: 'Shiva', aliases: [] },
  { name: 'Paraypora', aliases: [] },
  { name: 'Rebban', aliases: [] },
  { name: 'Achabal', aliases: [] },
  { name: 'Lorihama', aliases: [] },
  { name: 'Ladoora', aliases: [] },
  { name: 'Ferozpora', aliases: [] },
  { name: 'Hadipora', aliases: [] },

  // Nearby towns / tehsils
  { name: 'Baramulla', aliases: [] },
  { name: 'Pattan', aliases: [] },
  { name: 'Kreeri', aliases: [] },
  { name: 'Watergam', aliases: [] },
  { name: 'Rafiabad', aliases: [] },
  { name: 'Handwara', aliases: [] },
  { name: 'Kupwara', aliases: [] },
  { name: 'Bandipora', aliases: [] },
  { name: 'Tangmarg', aliases: [] },
  { name: 'Uri', aliases: [] },
  { name: 'Boniyar', aliases: [] },
  { name: 'Wagoora', aliases: [] }
];