export const colors = {
  bg: '#050707',
  bgSoft: '#0c0f0f',
  surface: '#111414',
  line: 'rgba(255,255,255,0.14)',
  lineStrong: 'rgba(255,255,255,0.4)',
  text: '#F2F2F0',
  textDim: 'rgba(242,242,240,0.62)',
  textFaint: 'rgba(242,242,240,0.36)',
  red: '#FF2A2A',
  redDeep: '#B3001B',
  cyan: '#2EF2FF',
  yellow: '#FFD60A',
} as const;

export const fonts = {
  display: 'PixelifySans_400Regular',
  displayBold: 'PixelifySans_700Bold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
} as const;

export const layout = {
  maxWidth: 1180,
  navHeight: 64,
} as const;

export const images = {
  logo: require('../../assets/opio/logo-white.png'),
  logoTexture: require('../../assets/opio/logo-textura.webp'),
  fundo02: require('../../assets/opio/fundo-02.webp'),
  fundo03: require('../../assets/opio/fundo-03.webp'),
  servicos: require('../../assets/opio/servicos-bg.webp'),
  producoes: require('../../assets/opio/producoes.webp'),
  contato: require('../../assets/opio/contato-bg.webp'),
  mapa: require('../../assets/opio/mapa.webp'),
  scanline: require('../../assets/opio/scanline.png'),
} as const;


export const fillAbs = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

