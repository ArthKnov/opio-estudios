# ØPIO ESTÚDIOS: site

Site de divulgação do estúdio **ØPIO ESTÚDIOS** feito com **Expo** (React Native + expo-router).
Funciona na web (mobile first, responsivo no desktop) e no celular via **Expo Go**.

- Intro animada com "clique para entrar", scanlines, glitch, halftone parallax
- Estúdios (Sala A e B, com fotos e vídeos do Instagram), serviços, produção FECIT (Spotify), contato e localização
- **Agendamento de visita** com Google Meet (backend em Google Apps Script, veja [`apps-script/`](./apps-script/README.md))

## Requisitos

- **Node.js 22.13 ou mais novo** (recomendado 24 LTS)

## Rodar localmente

```bash
npm install
cp .env.example .env.local    # (Windows: copy .env.example .env.local)
npm run web                   # abre em http://localhost:8081
```

Adicione `?skip` na URL (`http://localhost:8081/?skip`) para pular a intro durante o desenvolvimento.

### No celular (Expo Go)

```bash
npm start
```

Escaneie o QR code com o app **Expo Go** (celular e PC na mesma rede Wi-Fi).
Se a rede bloquear, use `npx expo start --tunnel`.

## Agendamento (Google Meet)

1. Siga [`apps-script/README.md`](./apps-script/README.md) (5 minutos) e copie a URL do Web App.
2. Coloque em `.env.local`: `EXPO_PUBLIC_SCHEDULE_ENDPOINT=https://script.google.com/macros/s/.../exec`
   (use `mock` para simular sem o backend).
3. O **e-mail que recebe os agendamentos** é a propriedade `OWNER_EMAIL` do Apps Script. Ele não fica no código do site.

Dias/horários disponíveis: `src/constants/schedule.ts` (mantenha igual ao `CONFIG` do `Code.gs`).

## Publicar no GitHub Pages

O workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) publica a cada push na branch `main`.

1. No repositório: **Settings > Pages > Source: GitHub Actions**.
2. **Settings > Secrets and variables > Actions > Variables**: crie `EXPO_PUBLIC_SCHEDULE_ENDPOINT` com a URL do Apps Script.
3. Faça push. O site fica em `https://<usuario>.github.io/opio-estudios/`.

Build manual: `EXPO_BASE_URL=/opio-estudios npm run build:web` (gera `dist/`).
Com domínio próprio, defina a variável do repositório `EXPO_BASE_URL` como `/`.

## Scripts

| Comando             | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `npm run web`       | servidor de desenvolvimento (web)           |
| `npm start`         | Expo Go (QR code)                           |
| `npm run typecheck` | checagem de tipos                           |
| `npm run lint`      | ESLint                                      |
| `npm run build:web` | build estático para hospedagem (`dist/`)    |

## Estrutura

```
src/app/            rotas (index = página única) e _layout
src/components/     Intro, Nav, sections/, fx/ (efeitos), schedule/, ui/
src/constants/      theme (cores, fontes), content (textos), schedule (regras)
assets/opio/        logos, fundos halftone, fotos/vídeos dos estúdios
apps-script/        backend do agendamento (Google Apps Script)
```

## Identidade visual

Cores: preto `#050707`, branco `#F2F2F0`, vermelho `#FF2A2A`, ciano `#2EF2FF`, amarelo `#FFD60A`.
Fontes: **Pixelify Sans** (títulos) e **DM Mono** (texto), substitutas gratuitas da CoFo Sans Pixel do ID visual.
