# Insider Loop

**Champion Project of the Solana x TrendsDoFun Hackathon**

Language: English | [简体中文](./README.zh-CN.md)

## Project Overview

**Insider Loop** is a Solana-themed strategy card trading game focused on decision-making, risk control, and replayable market simulation.

Players build and execute a daily card sequence to influence market movement, manage capital under uncertainty, and push for weekly target returns. The experience combines deck strategy, stochastic events, and progression pressure into a fast session loop that remains readable and skill-driven.

## Core Gameplay

- **Weekly progression model**: each run is organized into multi-day, multi-week goals with escalating pressure
- **Card-driven market control**: players compose red/green card sequences to shape direction and volatility
- **Event interference layer**: random market events are resolved independently from card effects for consistent logic
- **Capital management**: trade timing and position sizing directly impact survival and week-clear outcomes
- **Result settlement**: final performance is evaluated and can be submitted to leaderboard / on-chain flow

## System Design Highlights

- **Modular card architecture** with reusable extension interfaces for future card types and effect rules
- **Refactored random event engine** with isolated calculation pipeline to avoid coupling bugs
- **Leaderboard + wallet flow** enabling optional score upload through Solana transaction flow (gas required)
- **Bilingual UX (`zh/en`)**, guided tutorial, audio feedback, and chart-based market presentation

## Tech Stack

- `Vue 3`
- `Vite`
- `@solana/web3.js`
- `@solana/wallet-adapter-base`
- `@solana/wallet-adapter-wallets`

## Quick Start

```bash
npm install
npm run dev
```

Default local URL is usually `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```text
.
├─ src/                  # core frontend source code
├─ public/               # static assets
├─ index.html            # main entry
├─ game.html             # game entry (multi-page build)
├─ vite.config.js
├─ README.md
└─ README.zh-CN.md
```
