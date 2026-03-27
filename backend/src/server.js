import cors from 'cors';
import express from 'express';
import { WebSocketServer } from 'ws';
import { config, hasLiveSapCreds } from './config.js';
import { aggregateGlobal, fetchSapStock } from './sapClient.js';
import { getSimulationAggregates, initSimulationDb, tickSimulation } from './simulation.js';

const app = express();
app.use(cors());
app.use(express.json());

const systemCard = {
  systemName: 'DAS (ORANE DEMO)',
  appServer: '172.16.1.7',
  instance: '03',
  systemId: 'DAS',
  router: '202.3.72.106',
};

let lastPayload = {
  mode: hasLiveSapCreds ? 'live_sap' : 'simulation',
  generatedAt: new Date().toISOString(),
  system: systemCard,
  materials: [],
  categories: [],
};

async function buildPayload() {
  if (hasLiveSapCreds) {
    const raw = await fetchSapStock();
    const aggregate = aggregateGlobal(raw);
    return {
      mode: 'live_sap',
      generatedAt: new Date().toISOString(),
      system: systemCard,
      ...aggregate,
    };
  }

  await tickSimulation();
  const aggregate = await getSimulationAggregates();
  return {
    mode: 'simulation',
    generatedAt: new Date().toISOString(),
    system: systemCard,
    ...aggregate,
  };
}

app.get('/health', (_, res) => {
  res.json({ ok: true, mode: lastPayload.mode });
});

app.get('/api/inventory', (_, res) => {
  res.json(lastPayload);
});

const server = app.listen(config.port, async () => {
  if (!hasLiveSapCreds) {
    await initSimulationDb();
  }

  try {
    lastPayload = await buildPayload();
  } catch (error) {
    console.error('Initial inventory fetch failed:', error.message);
  }

  console.log(`Inventory backend listening on :${config.port}`);
});

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'snapshot', payload: lastPayload }));
});

setInterval(async () => {
  try {
    lastPayload = await buildPayload();
    const message = JSON.stringify({ type: 'inventory_update', payload: lastPayload });

    for (const client of wss.clients) {
      if (client.readyState === 1) {
        client.send(message);
      }
    }
  } catch (error) {
    console.error('Polling error:', error.message);
  }
}, config.pollMs);
