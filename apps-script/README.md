# Backend de agendamento (Google Apps Script)

Este script roda na **sua conta Google** e e quem cria o evento no Google Agenda com o link do **Google Meet**,
convida o visitante e envia um e-mail de aviso para o **OWNER_EMAIL**.
O site (GitHub Pages) so conversa com a URL publica do Web App.

## Instalacao (uma vez, ~5 minutos)

1. Acesse <https://script.google.com> com a conta Google cuja agenda vai receber as visitas e clique em **Novo projeto**.
   - De o nome `opio-agendamento`.
2. Em **Configuracoes do projeto** (engrenagem), marque **"Mostrar arquivo de manifesto appsscript.json no editor"**.
3. Cole o conteudo de [`Code.gs`](./Code.gs) no arquivo `Code.gs` e o de [`appsscript.json`](./appsscript.json) no `appsscript.json`
   (o manifesto ja ativa o servico avancado **Google Calendar** e o fuso de Sao Paulo).
4. Ainda em **Configuracoes do projeto > Propriedades do script**, adicione:
   | Propriedade   | Valor                                           |
   | ------------- | ----------------------------------------------- |
   | `OWNER_EMAIL` | o e-mail que deve receber os avisos (ex.: `opioestudios@gmail.com`) |
5. No editor, selecione a funcao **`setup`** e clique em **Executar**. Aceite as permissoes (Calendar e envio de e-mail).
   O log deve mostrar o `OWNER_EMAIL` e os horarios ocupados de amanha.
6. Clique em **Implantar > Nova implantacao > Tipo: App da Web**:
   - **Executar como:** Eu
   - **Quem tem acesso:** Qualquer pessoa
   - Copie a **URL do app da Web** (termina em `/exec`).
7. Coloque essa URL no site:
   - Local: arquivo `.env.local` -> `EXPO_PUBLIC_SCHEDULE_ENDPOINT=https://script.google.com/macros/s/XXXX/exec`
   - GitHub Pages: *Settings > Secrets and variables > Actions > Variables* -> `EXPO_PUBLIC_SCHEDULE_ENDPOINT`

> Sempre que alterar o `Code.gs`, faca **Implantar > Gerenciar implantacoes > Editar > Nova versao** para publicar a mudanca
> (a URL continua a mesma).

## Regras de disponibilidade

Dias, horarios, duracao e antecedencia ficam em `CONFIG` no topo do `Code.gs` e **precisam ser iguais** a
`src/constants/schedule.ts` do site (o site usa para desenhar o calendario; o script sempre revalida).

- Horarios que ja tem evento no seu Google Agenda aparecem como indisponiveis automaticamente.
- Para bloquear um horario/dia, basta criar um evento na agenda (nao marque como "Livre").

## Seguranca

- O e-mail do dono **nao vai para o site**: ele fica so nas Propriedades do script.
- O script valida todos os campos, limita 1 pedido por e-mail a cada 60 s, usa lock para evitar horario duplicado e ignora
  envios que preenchem o campo escondido (honeypot).
- A URL do Web App e publica (qualquer site pode chamar), por isso as validacoes acima ficam no servidor.

## Teste rapido

Abra `URL/exec?action=busy&date=2026-11-16` no navegador: deve responder `{"ok":true,"busy":[...]}`.
