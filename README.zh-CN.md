# Insider Loop

**Solana x TrendsDoFun 黑客松冠军项目**

语言：简体中文 | [English](./README.md)

## 项目介绍

**Insider Loop** 是一个策略卡牌交易游戏。

玩家需要通过构建并执行每日卡牌序列来影响市场走势，在不确定性中管理资金，并逐周冲击收益目标。项目将卡组策略、随机事件与阶段目标压力结合为一个高复玩、反馈清晰的短局循环。

## 核心玩法

- **周目标推进**：以多日、多周为单位进行阶段挑战，目标逐步收紧
- **卡牌驱动市场**：通过红/绿卡组合影响价格方向与波动幅度
- **事件干预层**：随机事件与卡牌效果独立结算，保证逻辑稳定与可解释性
- **资金管理机制**：买入时机与仓位决策直接决定生存率与通关效率
- **结果结算与排行**：局末统计成绩，可进入排行榜并支持链上提交流程

## 系统设计亮点

- **模块化卡牌架构**：预留可复用扩展接口，便于新增卡牌类型与效果规则
- **重构随机事件引擎**：隔离事件链路与卡牌链路，修复互相干扰导致的结算偏差
- **排行榜与钱包流程**：支持通过 Solana 交易流程上传成绩（需 gas）
- **完整产品体验**：中英双语、教程引导、音效反馈与图表化市场展示

## 技术栈

- `Vue 3`
- `Vite`
- `@solana/web3.js`
- `@solana/wallet-adapter-base`
- `@solana/wallet-adapter-wallets`

## 快速开始

```bash
npm install
npm run dev
```

默认本地地址通常为 `http://localhost:5173`。

## 构建与预览

```bash
npm run build
npm run preview
```

## 项目结构

```text
.
├─ src/                  # 核心前端源码
├─ public/               # 静态资源
├─ index.html            # 主入口
├─ game.html             # 游戏入口（多页面构建）
├─ vite.config.js
├─ README.md
└─ README.zh-CN.md
```
