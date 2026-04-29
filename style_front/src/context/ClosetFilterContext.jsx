import React, { createContext, useContext, useState } from 'react';

const ClosetFilterContext = createContext(null);

export function ClosetFilterProvider({ children }) {
  const [category, setCategory] = useState('all');
  const [color, setColor] = useState(null);
  const [formality, setFormality] = useState(null);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const filters = {
    category: category === 'all' ? null : category,
    color: color && color !== 'all' ? color : null,
    formality: formality || null,
    search: search && search.trim() ? search.trim() : null,
  };

  return (
    <ClosetFilterContext.Provider
      value={{
        category,
        setCategory,
        color,
        setColor,
        formality,
        setFormality,
        search,
        setSearch,
        filters,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </ClosetFilterContext.Provider>
  );
}

export function useClosetFilters() {
  const ctx = useContext(ClosetFilterContext);
  if (!ctx) return { filters: {}, setCategory: () => {}, setColor: () => {}, setFormality: () => {}, setSearch: () => {}, refreshKey: 0, triggerRefresh: () => {} };
  return ctx;
}
