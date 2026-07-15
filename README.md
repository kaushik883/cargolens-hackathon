# CargoLens 🚚

> AI-powered freight intelligence platform — built for hackathon.

## Overview

CargoLens helps logistics teams instantly analyze freight invoices, detect billing anomalies, generate shipping quotes, and track shipments — all in one place.

## Features

- 📄 **Invoice Analysis** — Upload freight invoices and get instant AI-powered charge breakdowns
- 🚨 **Anomaly Detection** — Automatically flag overbilling, duplicate charges, and rate mismatches
- 💬 **Copilot** — Natural language assistant for freight queries
- 📦 **Quote Management** — Generate and compare freight quotes
- 🗺️ **Shipment Tracking** — Real-time shipment status updates
- 🔐 **Multi-tenant Auth** — Company-level access control with Super Admin panel

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS

**Backend** *(in progress)*
- Python / FastAPI
- PostgreSQL
- OpenAI API

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
cargolens/
├── frontend/        # React frontend
│   ├── src/
│   │   ├── pages/       # Route-level components
│   │   ├── components/  # Reusable UI components
│   │   ├── api/         # API client & types
│   │   └── hooks/       # Custom React hooks
└── backend/         # FastAPI backend (WIP)
```

## Team

Built with ❤️ at the hackathon.
