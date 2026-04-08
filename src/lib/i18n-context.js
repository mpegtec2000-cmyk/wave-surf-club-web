'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries } from './i18n/dictionaries';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('es');

  // Cargar persistencia desde localStorage al montar
  useEffect(() => {
    const savedLang = localStorage.getItem('wave_lang');
    if (savedLang && dictionaries[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  const changeLang = (newLang) => {
    if (dictionaries[newLang]) {
      setLang(newLang);
      localStorage.setItem('wave_lang', newLang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = dictionaries[lang];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback a 'es' si la clave no existe en el idioma actual
        let fallback = dictionaries['es'];
        for (const fk of keys) {
          if (fallback) fallback = fallback[fk];
        }
        return fallback || key; // Retorna la llave original si no existe ni en 'es'
      }
    }
    return value;
  };

  return (
    <I18nContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
