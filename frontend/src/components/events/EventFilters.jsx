'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';

const categories = ['All', 'Music', 'Tech', 'Sports', 'Arts', 'Food', 'Culture'];

export default function EventFilters({ filters, onChange }) {
  const handleSearch = (e) => {
    onChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleCategory = (cat) => {
    onChange({ ...filters, category: cat === 'All' ? '' : cat, page: 1 });
  };

  const clearSearch = () => {
    onChange({ ...filters, search: '', page: 1 });
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          type="text"
          placeholder="Search events, locations..."
          value={filters.search || ''}
          onChange={handleSearch}
          className="input pl-10 pr-10"
        />
        {filters.search && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal size={14} className="text-ink-500 shrink-0" />
        {categories.map((cat) => {
          const active = (filters.category || '') === (cat === 'All' ? '' : cat);
          return (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                ${active
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-100 text-ink-700 hover:bg-surface-200'
                }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}