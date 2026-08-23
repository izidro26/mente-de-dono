# Verbo — Bíblia NVI Inteligente

Um app de Bíblia (PWA) com a **NVI (Nova Versão Internacional)** como tradução
padrão, leitura **online e offline**, e um conjunto de recursos pensados para
ir além do que a maioria dos apps de Bíblia oferece: memorização com
repetição espaçada, planos de leitura adaptáveis, destaques e anotações,
compartilhamento de versículos como imagem, leitura em voz alta e explicações
por IA (opcional, com sua própria chave).

Feito para ser instalável no celular (PWA), rápido e utilizável em qualquer
lugar — inclusive sem internet, depois da primeira leitura.

## Por que este app é diferente

A maioria dos apps de Bíblia é essencialmente um leitor de texto com busca.
O Verbo foi desenhado em torno de **hábito e retenção**, não só leitura:

- 🧠 **Memorização com repetição espaçada (SRS)** — o mesmo princípio usado
  pelo Anki (algoritmo derivado do SM-2). Marque um versículo como
  "memorizar" durante a leitura e ele entra num ciclo de revisão que se
  adapta ao seu desempenho.
- 📡 **Offline de verdade** — não é só "cachear a última página". Você pode
  baixar um livro, um testamento ou a Bíblia inteira para o dispositivo e
  continuar lendo, buscando, destacando e anotando sem internet.
- ✨ **IA opcional, sob seu controle** — traga sua própria chave da API da
  Anthropic (Claude) para desbloquear explicações de contexto e devocionais
  gerados na hora. Sem chave, o app funciona 100% normalmente — a IA nunca é
  obrigatória nem embutida às custas do usuário.
- 🗓️ **Planos de leitura de verdade** — não é uma lista estática: o progresso
  fica salvo por dia, com barra de progresso e retomada automática de onde
  você parou.
- 🔥 **Sequência de leitura (streak)** — gamificação leve para criar hábito,
  sem pressão de rede social: tudo fica só no seu aparelho.
- 🔗 **Compartilhar como imagem** — gera um cartão do versículo (canvas,
  sem serviço externo) pronto para postar ou enviar.
- 🔊 **Leitura em voz alta offline** — usa a Web Speech API nativa do
  navegador, sem depender de nenhum serviço de áudio externo.
- 🎓 **Estudos Teológicos (nível avançado)** — uma seção separada, mais densa,
  para quem já leu a Bíblia e quer ir além do devocional: os grandes temas
  ("loci") da teologia sistemática (Bibliologia, Cristologia, Soteriologia,
  Escatologia etc.), com as principais posições de diferentes tradições
  cristãs lado a lado — Reformada, Luterana, Arminiana/Wesleyana, Católica,
  Ortodoxa — sem apontar nenhuma como "a certa". A IA de aprofundamento dessa
  seção segue a mesma regra de neutralidade doutrinária (ver
  `src/lib/ai.ts`).
- 🔒 **Privacidade por padrão** — notas, destaques, favoritos, progresso de
  planos e streak vivem só no IndexedDB do seu dispositivo. Não há conta,
  login ou servidor do Verbo coletando esses dados.

## Sobre o texto da NVI (e por que ele não está no código)

A **NVI é uma tradução com direitos autorais** (© Biblica / Sociedade Bíblica
Internacional), então o código-fonte deste app **não embute** o texto
bíblico. Em vez disso:

1. O texto de cada capítulo é buscado em tempo real de um provedor HTTP
   configurável — por padrão, a API pública e gratuita
   [A Bíblia Digital](https://www.abibliadigital.com.br/api) — que já retorna
   a NVI entre suas versões disponíveis.
2. Assim que um capítulo é aberto (online), ele fica salvo no IndexedDB do
   dispositivo, exatamente como o "baixar para ler offline" de qualquer app
   de Bíblia — permitindo releitura, busca e destaques sem internet depois.
3. A tela **Ajustes → Provedor do texto bíblico** permite trocar a URL da
   API e informar um token de acesso, caso o provedor exija.

> Se o formato de resposta do provedor mudar, o único arquivo que precisa de
> ajuste é `src/lib/bibleProvider.ts` — o resto do app não depende do
> formato específico da API.

## Stack técnica

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (tema claro/escuro via CSS custom properties)
- **PWA** via `vite-plugin-pwa` (service worker com cache stale-while-revalidate
  para o texto bíblico, app instalável, funciona offline)
- **Dexie.js** (IndexedDB) para cache de capítulos, notas, destaques,
  favoritos, progresso de planos, cartões de memorização e streak
- **Zustand** (com persistência em `localStorage`) para preferências do
  usuário
- **React Router** para navegação
- Web Speech API (TTS) e Canvas API (compartilhar versículo como imagem) —
  ambas nativas do navegador, sem dependências externas

## Rodando localmente

```bash
npm install
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção (gera o service worker também)
npm run preview   # serve o build de produção localmente
npm run lint       # oxlint
```

Requer Node 20+.

## Gerando o APK Android

O app é empacotado como app Android nativo via [Capacitor](https://capacitorjs.com/)
(`android/` é o projeto nativo gerado por `npx cap add android`, já commitado).

**Automático (recomendado):** todo push em `bible-nvi-app/**` dispara o
workflow `.github/workflows/android-apk.yml`, que builda o APK debug nos
runners do GitHub (eles já vêm com Android SDK) e o publica como artefato do
workflow — baixe em **Actions → Build Verbo Android APK → (execução) →
Artifacts**. Também dá pra disparar manualmente pela aba Actions
("Run workflow").

**Local**, se você tiver o Android SDK instalado (via Android Studio):

```bash
npm run android:debug     # gera android/app/build/outputs/apk/debug/app-debug.apk
```

> Por quê não geramos o APK aqui no sandbox de desenvolvimento? Ele não tem o
> Android SDK instalado nem acesso de rede a `dl.google.com` (necessário para
> baixá-lo), então o build acontece no GitHub Actions. O ícone do app usa o
> placeholder padrão do Capacitor por enquanto — troque em
> `android/app/src/main/res/mipmap-*` (ou pelo Android Studio's Image Asset
> Studio) quando quiser um ícone customizado. Para publicar na Play Store,
> seria necessário gerar um build `release` assinado com uma keystore própria
> (`npm run android:release` + configuração de assinatura), o que não está
> feito aqui de propósito — assinatura de release é uma decisão que só o
> dono da conta de desenvolvedor deve tomar.

## Estrutura do projeto

```
src/
  data/            # metadados estruturais: 66 livros, planos de leitura,
                    # conteúdo de teologia sistemática (estudos)
  lib/             # camada de dados/serviços (Dexie, provedor bíblico,
                    # SRS, TTS, compartilhar imagem, IA, referências)
  store/           # estado global (Zustand): preferências, última leitura
  components/      # componentes de UI reutilizáveis
  pages/           # uma página por rota
android/           # projeto nativo Android gerado pelo Capacitor (commitado)
.github/workflows/ # pipeline de build do APK (roda nos runners do GitHub)
```

## Configuração opcional

Tudo funciona sem nenhuma configuração além de conexão à internet na
primeira leitura de cada capítulo. Em **Ajustes** você pode, opcionalmente:

- Trocar a tradução padrão (NVI, ACF, ARA, KJV — depende do que o provedor
  bíblico configurado oferecer)
- Configurar um token de acesso do provedor bíblico, se necessário
- Colar sua própria chave da API da Anthropic para habilitar explicações de
  versículos e devocionais gerados por IA (a chave fica só no seu
  dispositivo; as chamadas vão direto do navegador para a Anthropic)
- Ajustar tema, tamanho de fonte e velocidade da leitura em voz alta

## Roadmap / ideias futuras

- Comparação lado a lado entre duas traduções na tela de leitura
- Grafo visual de referências cruzadas entre versículos
- Exportar/importar notas e destaques (backup manual)
- Modo "jogo da memória" com lacunas no texto, além do flashcard atual
