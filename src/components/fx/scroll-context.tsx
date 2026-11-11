import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

export type ScrollContextValue = {
  /** Posicao atual do scroll (UI thread). */
  scrollY: SharedValue<number>;
  /** Altura visivel da area de scroll. */
  viewportH: SharedValue<number>;
  /** So vira 1 depois que o visitante entra no site (fim da intro). */
  active: SharedValue<number>;
  /** Navega ate uma secao. */
  scrollToSection: (id: string) => void;
};

export const ScrollContext = createContext<ScrollContextValue | null>(null);

export function useScrollContext() {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error('ScrollContext ausente');
  return ctx;
}
