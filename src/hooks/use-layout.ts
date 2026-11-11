import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const breakpoint: Breakpoint = width >= 1100 ? 'desktop' : width >= 768 ? 'tablet' : 'mobile';
  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';
  /** Padding horizontal fluido das secoes. */
  const gutter = isMobile ? 22 : breakpoint === 'tablet' ? 40 : 56;
  /** Escala tipografica fluida (1 no mobile, ate ~1.5 no desktop largo). */
  const scale = Math.min(1.5, Math.max(1, 0.82 + width / 1600));
  return { width, height, breakpoint, isMobile, isDesktop, isTablet: breakpoint === 'tablet', gutter, scale };
}
