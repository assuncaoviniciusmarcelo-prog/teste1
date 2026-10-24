// Função serverless da Vercel: entrega credenciais TURN de curta duração ao jogo.
// Sem variáveis de ambiente configuradas, devolve lista vazia e o jogo usa só STUN.
//
// Opção A (Cloudflare Realtime TURN):  CF_TURN_KEY_ID  +  CF_TURN_API_TOKEN
// Opção B (Metered):                   METERED_DOMAIN (ex.: meuapp.metered.live)  +  METERED_API_KEY

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const { CF_TURN_KEY_ID, CF_TURN_API_TOKEN, METERED_DOMAIN, METERED_API_KEY } = process.env;

  try {
    if (CF_TURN_KEY_ID && CF_TURN_API_TOKEN) {
      const r = await fetch(
        `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(CF_TURN_KEY_ID)}/credentials/generate-ice-servers`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${CF_TURN_API_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ttl: 86400 })
        }
      );
      if (r.ok) {
        const j = await r.json();
        const ice = Array.isArray(j.iceServers) ? j.iceServers : [j.iceServers];
        return res.status(200).json({ provider: 'cloudflare', iceServers: ice.filter(Boolean) });
      }
    }

    if (METERED_DOMAIN && METERED_API_KEY) {
      const host = METERED_DOMAIN.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const r = await fetch(`https://${host}/api/v1/turn/credentials?apiKey=${encodeURIComponent(METERED_API_KEY)}`);
      if (r.ok) {
        const ice = await r.json();
        if (Array.isArray(ice)) return res.status(200).json({ provider: 'metered', iceServers: ice });
      }
    }
  } catch (e) {
    // qualquer falha cai no modo só-STUN
  }
  return res.status(200).json({ provider: 'none', iceServers: [] });
};
