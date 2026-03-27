# Real-time S/4HANA Inventory Monitor

Recipe-1 style technical dashboard with a live Express + WebSocket backend and a React/Tailwind frontend.

## Architecture

- **Backend**: Express API + WebSocket (`/ws`) broadcaster.
- **Live mode**: Proxies SAP OData endpoint `API_MATERIAL_STOCK_SRV/A_MatlStkInAcctMod`.
- **Simulation mode**: In-memory SQLite using CTE + Window Function aggregation to mimic HANA code-to-data logic.
- **Frontend**: React + Tailwind + Recharts + lucide-react + motion transitions.

## Setup

```bash
cp .env.example backend/.env
npm run install:all
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

## SAP Connectivity

Set the following in `backend/.env`:

- `SAP_URL`
- `SAP_USERNAME`
- `SAP_PASSWORD`
- `SAP_CLIENT`
- `SAP_PLANTS` (comma-separated)

If credentials are missing, the app automatically runs **simulation mode** with continuously changing stock values.

## Features Delivered

- DAS system ID card with fixed landscape metadata.
- Global aggregation by material and category across plants.
- Category cards, top-10 material stock bar chart, and live table with low-stock alerts (`< 500`).
- Technical View tab with simulated ABAP AMDP and CDS examples.
- WebSocket push updates so any number of clients can connect and receive current inventory snapshots in real time.
