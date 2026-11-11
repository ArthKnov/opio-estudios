import type { ImageSource } from 'expo-image';

export const brand = {
  name: 'ØPIO ESTÚDIOS',
  short: 'ØPIO',
  tagline: 'Produção musical do primeiro acorde ao lançamento.',
  phoneDisplay: '(11) 94723-5148',
  phoneTel: 'tel:+5511947235148',
  whatsapp: 'https://wa.me/5511947235148',
  email: 'opioestudios@gmail.com',
  instagramHandle: '@opio.estudios',
  instagram: 'https://www.instagram.com/opio.estudios/',
} as const;

export const services = [
  { id: 'direcao', title: 'Direção Musical', text: 'Visão artística e curadoria do projeto, do conceito ao resultado final.' },
  { id: 'pre', title: 'Pré-produção', text: 'Arranjos, referências e planejamento antes de apertar o REC.' },
  { id: 'gravacao', title: 'Gravação & Produção', text: 'Captação de voz e instrumentos em salas tratadas, com equipe técnica.' },
  { id: 'mix', title: 'Mix & Master', text: 'Equilíbrio, impacto e finalização para qualquer plataforma.' },
  { id: 'lancamento', title: 'Lançamento', text: 'Estratégia e entrega para colocar sua música no mundo.' },
] as const;

export type MediaItem =
  | { type: 'image'; source: ImageSource | number; alt: string }
  | { type: 'video'; source: number; poster: ImageSource | number; alt: string };

export type Studio = {
  id: 'sala-a' | 'sala-b';
  index: string;
  title: string;
  kicker: string;
  address: string;
  paragraphs: string[];
  cta: string;
  hashtags: string[];
  postUrl: string;
  mapsUrl: string;
  media: MediaItem[];
};

/* Textos extraidos das publicacoes do Instagram @opio.estudios (06/11/2026). */
export const studios: Studio[] = [
  {
    id: 'sala-a',
    index: '01',
    title: 'Sala A',
    kicker: 'Gravação conjunta',
    address: 'Rua Dom Estevão Pimentel, 207',
    paragraphs: [
      'Conheça a “Sala A” da ØPIO ESTÚDIOS!',
      'A Sala A conta com toda a infraestrutura de tratamento e isolamento acústico, além dos equipamentos que permitem receber e gravar qualquer tipo de música, artista ou banda. Nessa sala são realizadas as sessões conjuntas de gravação de instrumentos e voz e ela fica localizada na Rua Dom Estevão Pimentel, 207.',
    ],
    cta: 'Entre em contato para conhecer nosso portifólio e fazer um orçamento!',
    hashtags: ['produçãomusical', 'estudio', 'gravação'],
    postUrl: 'https://www.instagram.com/p/DfahOhQlu-P/',
    mapsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJ8-CctMddzpQR0UNQsmOSXrY',
    media: [
      { type: 'image', source: require('../../assets/opio/studio/sala-a-1.webp'), alt: 'Sala A: bateria, guitarras e tratamento acústico' },
      { type: 'video', source: require('../../assets/opio/studio/sala-a-2.mp4'), poster: require('../../assets/opio/studio/sala-a-2-poster.jpg'), alt: 'Sala A: guitarra e painéis acústicos' },
      { type: 'image', source: require('../../assets/opio/studio/sala-a-3.webp'), alt: 'Sala A: vista geral com bateria e mesa de gravação' },
      { type: 'video', source: require('../../assets/opio/studio/sala-a-4.mp4'), poster: require('../../assets/opio/studio/sala-a-4-poster.jpg'), alt: 'Sala A: detalhe do tratamento acústico' },
    ],
  },
  {
    id: 'sala-b',
    index: '02',
    title: 'Sala B',
    kicker: 'Teclas, pianos e sintetizadores',
    address: 'Rua Baronesa de Itu, Santa Cecília',
    paragraphs: [
      'Conheça a “Sala B” da ØPIO ESTÚDIOS!',
      'A Sala B é um espaço alternativo para gravações de instrumentais, especialmente teclado, pianos e sintetizadores. Com a infraestrutura ideal para sua produção, a Sala B também é indicada para revisões de mix e master e fica localizada na Rua Baronesa de Itu (Santa Cecília).',
    ],
    cta: 'Entre em contato para conhecer nosso portifólio e fazer um orçamento!',
    hashtags: ['produçãomusical', 'estudio', 'gravação'],
    postUrl: 'https://www.instagram.com/p/Dfahv4hlqB8/',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Baronesa+de+Itu%2C+Santa+Cec%C3%ADlia%2C+S%C3%A3o+Paulo',
    media: [
      { type: 'image', source: require('../../assets/opio/studio/sala-b-1.webp'), alt: 'Sala B: teclados, monitores e mesa de produção' },
      { type: 'video', source: require('../../assets/opio/studio/sala-b-2.mp4'), poster: require('../../assets/opio/studio/sala-b-2-poster.jpg'), alt: 'Sala B: microfone, sintetizadores e guitarra' },
      { type: 'image', source: require('../../assets/opio/studio/sala-b-3.webp'), alt: 'Sala B: teclados e janela com vista da cidade' },
      { type: 'image', source: require('../../assets/opio/studio/sala-b-4.webp'), alt: 'Sala B: sintetizadores, monitores e estante' },
    ],
  },
];

export const production = {
  title: 'FECIT',
  kicker: 'Produções',
  text: 'Uma produção ØPIO. Dê o play e entre no universo do FECIT.',
  spotifyTrackId: '12zRQkgiqDbm0vXBrGhJS8',
  spotifyUrl: 'https://open.spotify.com/intl-pt/track/12zRQkgiqDbm0vXBrGhJS8?si=68df93c205834be2',
};

export const location = {
  address: 'R. Dom Estevão Pimentel, 207',
  mapsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJ8-CctMddzpQR0UNQsmOSXrY',
};

export const navItems = [
  { id: 'estudios', label: 'Estúdios' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'producoes', label: 'Produções' },
  { id: 'contato', label: 'Contato' },
  { id: 'localizacao', label: 'Localização' },
] as const;

export type SectionId = 'inicio' | (typeof navItems)[number]['id'];

