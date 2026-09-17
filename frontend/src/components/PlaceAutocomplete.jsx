import { useEffect, useRef, useState } from 'react';
import { fuzzyMatchesName, nameMatchRank } from '../utils/fuzzySearch';
import { places } from '../constants/places';

const MAX_SUGGESTIONS = 6;
const MIN_QUERY_LENGTH = 2;

// Ranks a place against the typed query using both its canonical name and
// its known aliases (e.g. "k colny" -> Krankshivan Colony). A place matches
// if EITHER the name or any alias fuzzy-matches; its rank is the best
// (lowest) of those, so an exact alias match still sorts to the top even if
// the canonical name itself is a weaker match.
function bestRank(place, query) {
  const candidates = [place.name, ...place.aliases];
  let best = null;
  for (const candidate of candidates) {
    if (fuzzyMatchesName(candidate, query)) {
      const rank = nameMatchRank(candidate, query);
      if (best === null || rank < best) best = rank;
    }
  }
  return best; // null means no match
}

function getSuggestions(query) {
  if (query.trim().length < MIN_QUERY_LENGTH) return [];

  return places
    .map((place) => ({ place, rank: bestRank(place, query) }))
    .filter(({ rank }) => rank !== null)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ place }) => place.name);
}

// Plain text input with a place-suggestion dropdown underneath. Matches the
// existing dark-theme input styling via the `className` passed in, so it
// drops into AddMemberForm / MemberCard / MemberRow unchanged.
//
// `onChange` receives the new string value directly (not an event) so it
// works the same whether the parent updates state via setFormData(e) or
// setEditData(value) — the caller adapts on its end.
function PlaceAutocomplete({ name, value, onChange, onBlur, placeholder, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  const suggestions = getSuggestions(value || '');

  // Close the dropdown on any click outside this component.
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectPlace(placeName) {
    onChange(placeName);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event) {
    if (!isOpen || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      selectPlace(suggestions[highlightedIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        name={name}
        value={value || ''}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          // preventDefault() on the suggestion's mousedown (below) stops the
          // browser from blurring this input on click, so a real blur here
          // always means focus genuinely left the field — safe to close and
          // to pass the blur through untouched (e.g. AddMemberForm's
          // duplicate-residence check still fires normally).
          setIsOpen(false);
          onBlur?.(event);
        }}
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-[#1A1A1A] border border-[#333] rounded max-h-48 overflow-y-auto shadow-lg">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              onMouseDown={(event) => {
                event.preventDefault(); // keep input focused, skip the blur race
                selectPlace(suggestion);
              }}
              className={`px-3 py-2 text-sm cursor-pointer ${
                index === highlightedIndex
                  ? 'bg-[#2A2A2A] text-[#F2C230]'
                  : 'text-[#F5F5F0] hover:bg-[#2A2A2A]'
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlaceAutocomplete;