import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { PALETTES } from '../theme/palettes';
import { getSetting, updateSetting } from '../db/repository';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const db = useSQLiteContext();
  const [themeName, setThemeName] = useState('sage');
  const [articleLayout, setArticleLayoutState] = useState('editorial');
  const [trendLayout, setTrendLayoutState] = useState('mosaic');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSetting(db).then((row) => {
      if (!mounted || !row) return;
      setThemeName(PALETTES[row.theme] ? row.theme : 'sage');
      setArticleLayoutState(row.article_layout || 'editorial');
      setTrendLayoutState(row.trend_layout || 'mosaic');
      setReady(true);
    }).catch(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, [db]);

  const changeTheme = useCallback(async (name) => {
    const next = PALETTES[name] ? name : 'sage';
    setThemeName(next);
    await updateSetting(db, 'theme', next);
  }, [db]);
  const setArticleLayout = useCallback(async (layout) => {
    setArticleLayoutState(layout);
    await updateSetting(db, 'article_layout', layout);
  }, [db]);
  const setTrendLayout = useCallback(async (layout) => {
    setTrendLayoutState(layout);
    await updateSetting(db, 'trend_layout', layout);
  }, [db]);

  const value = useMemo(() => ({
    themeName, palette: PALETTES[themeName], palettes: PALETTES, changeTheme,
    articleLayout, setArticleLayout, trendLayout, setTrendLayout, ready,
  }), [themeName, changeTheme, articleLayout, setArticleLayout, trendLayout, setTrendLayout, ready]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used inside ThemeProvider');
  return value;
}
