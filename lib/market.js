const BINANCE_URL =
  'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22%2C%22ETHUSDT%22%5D';
const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true';

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function fromBinance() {
  const list = await getJson(BINANCE_URL);
  const bySymbol = Object.fromEntries(list.map((t) => [t.symbol, t]));
  return {
    btc: { price: Number(bySymbol.BTCUSDT.lastPrice), change: Number(bySymbol.BTCUSDT.priceChangePercent) },
    eth: { price: Number(bySymbol.ETHUSDT.lastPrice), change: Number(bySymbol.ETHUSDT.priceChangePercent) },
    source: 'binance',
  };
}

async function fromCoinGecko() {
  const j = await getJson(COINGECKO_URL);
  return {
    btc: { price: j.bitcoin.usd, change: j.bitcoin.usd_24h_change },
    eth: { price: j.ethereum.usd, change: j.ethereum.usd_24h_change },
    source: 'coingecko',
  };
}

async function fetchMarket() {
  try {
    return await fromBinance();
  } catch {
    return fromCoinGecko();
  }
}

function start(onUpdate, intervalMs = 60000) {
  const tick = async () => {
    try {
      onUpdate({ ...(await fetchMarket()), ts: Date.now() });
    } catch (err) {
      console.error('market:', err.message);
      onUpdate(null);
    }
  };
  tick();
  return setInterval(tick, intervalMs);
}

module.exports = { start, fetchMarket };
