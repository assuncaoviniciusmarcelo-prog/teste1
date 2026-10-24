# Hoop VLONE — deploy na Vercel + multiplayer com um amigo

O jogo é um único `index.html` (estático). O multiplayer usa PeerJS (WebRTC): o servidor de salas
público do PeerJS (`0.peerjs.com`) só faz o "encontro" e depois os dois navegadores conversam direto.
A Vercel serve o jogo por HTTPS e, opcionalmente, entrega um servidor TURN (`/api/turn`) para
redes que bloqueiam conexão direta.

## 1) Publicar

**Pelo site (mais fácil)**
1. Crie um repositório no GitHub e envie estes arquivos (`index.html`, `api/`, `vercel.json`, `package.json`).
2. Em vercel.com → *Add New… → Project* → importe o repositório.
3. Framework Preset: **Other**. Deixe *Build Command* e *Output Directory* vazios → **Deploy**.

**Pelo terminal**
```bash
npm i -g vercel
cd vercel-deploy
vercel --prod
```

## 2) Jogar com o amigo
1. Vocês dois abrem a **mesma URL** da Vercel (`https://seu-projeto.vercel.app`).
2. Um clica em criar sala e manda o **código** de 5 letras; o outro digita o código e entra.
3. O anfitrião precisa ficar no menu inicial até o amigo conectar.

Se seu amigo cair numa tela de login da Vercel: em *Settings → Deployment Protection* desative a
proteção, ou use o domínio de **Production** (não o link de um deploy de preview).

## 3) TURN (recomendado se não conectar)
Sem TURN, a conexão falha quando um dos dois está em 4G/5G, rede de empresa/escola ou NAT restritivo.
Configure **um** dos provedores em *Project → Settings → Environment Variables* e faça **Redeploy**:

| Provedor | Variáveis |
|---|---|
| Cloudflare Realtime TURN | `CF_TURN_KEY_ID`, `CF_TURN_API_TOKEN` (painel Cloudflare → Realtime → TURN → criar chave) |
| Metered | `METERED_DOMAIN` (ex.: `meuapp.metered.live`), `METERED_API_KEY` |

Confira as cotas gratuitas atuais no painel do provedor. Para testar: abra `https://seu-projeto.vercel.app/api/turn`
— deve mostrar `"provider":"cloudflare"` (ou `metered`) e uma lista de `iceServers`. Com `"provider":"none"`,
nenhuma variável foi lida (confira o nome e o redeploy).

## 4) Mensagens do menu
- **SALA NÃO ENCONTRADA** — código errado ou anfitrião saiu do menu.
- **SERVIDOR DE SALAS INDISPONÍVEL / SEM ACESSO** — problema de internet ou do servidor público do PeerJS; tente de novo.
- **NÃO CONECTOU (REDE/NAT BLOQUEIA P2P)** — configure o TURN acima ou teste ambos no Wi-Fi.

Controles: `V` liga/desliga o filtro VHS; botão ☀/🌙 no canto esquerdo alterna dia e noite.
