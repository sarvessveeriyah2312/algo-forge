[21:04:33] [ENGINE] Starting backtest for: "EMA Momentum Scalp"
[21:04:33] [CONFIG] Instrument: EURUSD | 2026-05-01 → 2026-06-08
[21:04:33] [API] Backtest run created: eeb929fd-1651-4e4a-921e-62eaf2a7ab1e
[21:04:34] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[21:04:34] ALGOFORGE BACKTEST ENGINE
[21:04:34] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[21:04:34] [INIT] Strategy : EMA Momentum Scalp
[21:04:34] [INIT] Instrument: XAUUSD | Timeframe: M5 | Direction: BOTH
[21:04:34] [INIT] Date range: 2026-05-01 00:00:00+00:00 → 2026-06-08 23:00:00+00:00
[21:04:34] [INIT] Bars total: 648 | Warmup: 200 bars | Active bars: 448
[21:04:34] [INIT] Capital : $10,000.00 | Risk/Trade: 0.50% | Max DD: 2.00%
[21:04:34] [INIT] Costs : Spread: 10.0 pips | Commission: $5.00 | Slippage: 1.00000
[21:04:34] ────────────────────────────────────────────────────────────
[21:04:34] [INDICATORS] Pre-calculating indicators over full dataset...
[21:04:34] [INDICATORS] Computed: EMA(9), RSI(14)
[21:04:34] [INDICATORS] Entry conditions: 3 | Exit conditions: 0
[21:04:34] ────────────────────────────────────────────────────────────
[21:04:34] [ENGINE] Starting bar-by-bar loop from bar #200 ...
[21:04:34] ────────────────────────────────────────────────────────────
[21:04:34] [OPEN # 1] SHORT @ 2.17340 | SL: 2.17468 (12.8 pips) | TP: 2.17085 (25.5 pips) | R:R: 1:2.00 | Lots: 0.39 | Risk: $50.00
[21:04:34] Bar : 2026-05-13 08:00:00+00:00 | O:1.17344 H:1.17369 L:1.17319 C:1.17340 | Balance: $10,000.00
[21:04:34] [CLOSE # 1] SHORT TP | Entry: 2.17340 → Exit: 2.17085 | Pips: +25.5 | P&L: +$56.70 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $10,056.70
[21:04:34] Running → W:1 L:0 | WR:100.0% | Net:+56.70
[21:04:34] [OPEN # 2] LONG @ 2.17126 | SL: 2.16974 (15.2 pips) | TP: 2.17430 (30.4 pips) | R:R: 1:2.00 | Lots: 0.33 | Risk: $50.28
[21:04:34] Bar : 2026-05-13 13:00:00+00:00 | O:1.17061 H:1.17144 L:1.17018 C:1.17126 | Balance: $10,056.70
[21:04:34] [CLOSE # 2] LONG SL | Entry: 2.17126 → Exit: 2.16974 | Pips: -15.2 | P&L: $-86.46 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $9,970.24
[21:04:34] Running → W:1 L:1 | WR:50.0% | Net:-29.76
[21:04:34] [OPEN # 3] SHORT @ 2.17121 | SL: 2.17269 (14.8 pips) | TP: 2.16825 (29.6 pips) | R:R: 1:2.00 | Lots: 0.34 | Risk: $49.85
[21:04:34] Bar : 2026-05-13 14:00:00+00:00 | O:1.17126 H:1.17172 L:1.17106 C:1.17121 | Balance: $9,970.24
[21:04:34] [CLOSE # 3] SHORT TP | Entry: 2.17121 → Exit: 2.16825 | Pips: +29.6 | P&L: +$63.38 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $10,033.62
[21:04:34] Running → W:2 L:1 | WR:66.7% | Net:+33.62
[21:04:34] [OPEN # 4] LONG @ 2.17101 | SL: 2.16941 (16.0 pips) | TP: 2.17421 (32.0 pips) | R:R: 1:2.00 | Lots: 0.31 | Risk: $50.17
[21:04:34] Bar : 2026-05-13 16:00:00+00:00 | O:1.17017 H:1.17122 L:1.17000 C:1.17101 | Balance: $10,033.62
[21:04:35] [CLOSE # 4] LONG SL | Entry: 2.17101 → Exit: 2.16941 | Pips: -16.0 | P&L: $-83.63 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $9,949.99
[21:04:35] Running → W:2 L:2 | WR:50.0% | Net:-50.01
[21:04:35] [RISK ] DD WARNING 50% of limit | Current: 1.06% | Limit: 2.00% | 2026-05-13 17:00:00+00:00
[21:04:35] [OPEN # 5] SHORT @ 2.17076 | SL: 2.17235 (15.9 pips) | TP: 2.16757 (31.9 pips) | R:R: 1:2.00 | Lots: 0.31 | Risk: $49.75
[21:04:35] Bar : 2026-05-13 17:00:00+00:00 | O:1.17101 H:1.17125 L:1.17021 C:1.17076 | Balance: $9,949.99
[21:04:35] [CLOSE # 5] SHORT TP | Entry: 2.17076 → Exit: 2.16757 | Pips: +31.9 | P&L: +$64.79 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $10,014.78
[21:04:35] Running → W:3 L:2 | WR:60.0% | Net:+14.78
[21:04:35] [OPEN # 6] LONG @ 2.17109 | SL: 2.16951 (15.8 pips) | TP: 2.17425 (31.6 pips) | R:R: 1:2.00 | Lots: 0.32 | Risk: $50.07
[21:04:35] Bar : 2026-05-13 18:00:00+00:00 | O:1.17076 H:1.17162 L:1.17070 C:1.17109 | Balance: $10,014.78
[21:04:35] [CLOSE # 6] LONG SL | Entry: 2.17109 → Exit: 2.16951 | Pips: -15.8 | P&L: $-85.75 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $9,929.03
[21:04:35] Running → W:3 L:3 | WR:50.0% | Net:-70.97
[21:04:35] [OPEN # 7] SHORT @ 2.17085 | SL: 2.17243 (15.8 pips) | TP: 2.16768 (31.7 pips) | R:R: 1:2.00 | Lots: 0.31 | Risk: $49.65
[21:04:35] Bar : 2026-05-13 19:00:00+00:00 | O:1.17109 H:1.17179 L:1.17070 C:1.17085 | Balance: $9,929.03
[21:04:35] [CLOSE # 7] SHORT TP | Entry: 2.17085 → Exit: 2.16768 | Pips: +31.7 | P&L: +$64.08 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $9,993.11
[21:04:35] Running → W:4 L:3 | WR:57.1% | Net:-6.89
[21:04:35] [OPEN # 8] SHORT @ 2.17042 | SL: 2.17197 (15.5 pips) | TP: 2.16732 (31.0 pips) | R:R: 1:2.00 | Lots: 0.32 | Risk: $49.97
[21:04:35] Bar : 2026-05-13 20:00:00+00:00 | O:1.17085 H:1.17107 L:1.17035 C:1.17042 | Balance: $9,993.11
[21:04:35] [CLOSE # 8] SHORT TP | Entry: 2.17042 → Exit: 2.16732 | Pips: +31.0 | P&L: +$63.85 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $10,056.96
[21:04:35] Running → W:5 L:3 | WR:62.5% | Net:+56.96
[21:04:35] [OPEN # 9] LONG @ 2.17073 | SL: 2.16921 (15.2 pips) | TP: 2.17377 (30.4 pips) | R:R: 1:2.00 | Lots: 0.33 | Risk: $50.28
[21:04:35] Bar : 2026-05-13 21:00:00+00:00 | O:1.17042 H:1.17105 L:1.17028 C:1.17073 | Balance: $10,056.96
[21:04:35] [CLOSE # 9] LONG SL | Entry: 2.17073 → Exit: 2.16921 | Pips: -15.2 | P&L: $-86.45 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $9,970.51
[21:04:35] Running → W:5 L:4 | WR:55.6% | Net:-29.49
[21:04:35] [OPEN # 10] LONG @ 2.17096 | SL: 2.16948 (14.8 pips) | TP: 2.17392 (29.6 pips) | R:R: 1:2.00 | Lots: 0.34 | Risk: $49.85
[21:04:35] Bar : 2026-05-13 22:00:00+00:00 | O:1.17077 H:1.17130 L:1.17067 C:1.17096 | Balance: $9,970.51
[21:04:35] [CLOSE # 10] LONG SL | Entry: 2.17096 → Exit: 2.16948 | Pips: -14.8 | P&L: $-87.67 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $9,882.84
[21:04:35] Running → W:5 L:5 | WR:50.0% | Net:-117.16
[21:04:35] [RISK ] DD WARNING 50% of limit | Current: 1.73% | Limit: 2.00% | 2026-05-13 23:00:00+00:00
[21:04:35] [RISK ] DD WARNING 80% of limit | Current: 1.73% | Limit: 2.00% | 2026-05-13 23:00:00+00:00
[21:04:35] [OPEN # 11] LONG @ 2.17139 | SL: 2.16995 (14.4 pips) | TP: 2.17426 (28.7 pips) | R:R: 1:2.00 | Lots: 0.34 | Risk: $49.41
[21:04:35] Bar : 2026-05-13 23:00:00+00:00 | O:1.17095 H:1.17140 L:1.17080 C:1.17139 | Balance: $9,882.84
[21:04:35] [CLOSE # 11] LONG SL | Entry: 2.17139 → Exit: 2.16995 | Pips: -14.4 | P&L: $-86.27 | Duration: 1h 00m | R:R achieved: 1:2.00 | Balance: $9,796.57
[21:04:35] Running → W:5 L:6 | WR:45.5% | Net:-203.43
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 00:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 01:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 02:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 03:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 04:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 05:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 06:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 07:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 08:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 09:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 10:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 11:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 12:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 13:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 14:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 15:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 16:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 17:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 18:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 19:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 20:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 21:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 22:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-14 23:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 00:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 01:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 02:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 03:00:00+00:00 | No new entries until reset.
[21:04:36] [PROGRESS] 9% | Bar 244/648 | 2026-05-15 04:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 04:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 05:00:00+00:00 | No new entries until reset.
[21:04:36] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 06:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 07:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 08:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 09:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 10:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 11:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 12:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 13:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 14:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 15:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 16:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 17:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 18:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 19:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 20:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 21:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 22:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-15 23:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 00:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 01:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 02:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 03:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 04:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 05:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 06:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 07:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 08:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 09:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 10:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 11:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 12:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 13:00:00+00:00 | No new entries until reset.
[21:04:37] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 14:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 15:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 16:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 17:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 18:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 19:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 20:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 21:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 22:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-18 23:00:00+00:00 | No new entries until reset.
[21:04:38] [PROGRESS] 19% | Bar 288/648 | 2026-05-19 00:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 00:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 01:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 02:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 03:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 04:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 05:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 06:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 07:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 08:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 09:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 10:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 11:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 12:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 13:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 14:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 15:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 16:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 17:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 18:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 19:00:00+00:00 | No new entries until reset.
[21:04:38] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 20:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 21:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 22:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-19 23:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 00:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 01:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 02:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 03:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 04:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 05:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 06:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 07:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 08:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 09:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 10:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 11:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 12:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 13:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 14:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 15:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 16:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 17:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 18:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 19:00:00+00:00 | No new entries until reset.
[21:04:39] [PROGRESS] 29% | Bar 332/648 | 2026-05-20 20:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 20:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 21:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 22:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-20 23:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 00:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 01:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 02:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 03:00:00+00:00 | No new entries until reset.
[21:04:39] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 04:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 05:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 06:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 07:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 08:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 09:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 10:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 11:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 12:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 13:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 14:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 15:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 16:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 17:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 18:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 19:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 20:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 21:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 22:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-21 23:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 00:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 01:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 02:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 03:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 04:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 05:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 06:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 07:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 08:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 09:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 10:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 11:00:00+00:00 | No new entries until reset.
[21:04:40] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 12:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 13:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 14:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 15:00:00+00:00 | No new entries until reset.
[21:04:41] [PROGRESS] 39% | Bar 376/648 | 2026-05-22 16:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 16:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 17:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 18:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 19:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 20:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 21:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 22:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-22 23:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 00:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 01:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 02:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 03:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 04:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 05:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 06:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 07:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 08:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 09:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 10:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 11:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 12:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 13:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 14:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 15:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 16:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 17:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 18:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 19:00:00+00:00 | No new entries until reset.
[21:04:41] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 20:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 21:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 22:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-25 23:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 00:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 01:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 02:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 03:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 04:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 05:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 06:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 07:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 08:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 09:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 10:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 11:00:00+00:00 | No new entries until reset.
[21:04:42] [PROGRESS] 49% | Bar 420/648 | 2026-05-26 12:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 12:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 13:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 14:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 15:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 16:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 17:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 18:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 19:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 20:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 21:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 22:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-26 23:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 00:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 01:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 02:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 03:00:00+00:00 | No new entries until reset.
[21:04:42] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 04:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 05:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 06:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 07:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 08:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 09:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 10:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 11:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 12:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 13:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 14:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 15:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 16:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 17:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 18:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 19:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 20:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 21:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 22:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-27 23:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 00:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 01:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 02:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 03:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 04:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 05:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 06:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 07:00:00+00:00 | No new entries until reset.
[21:04:43] [PROGRESS] 58% | Bar 464/648 | 2026-05-28 08:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 08:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 09:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 10:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 11:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 12:00:00+00:00 | No new entries until reset.
[21:04:43] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 13:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 14:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 15:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 16:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 17:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 18:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 19:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 20:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 21:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 22:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-28 23:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 00:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 01:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 02:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 03:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 04:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 05:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 06:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 07:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 08:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 09:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 10:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 11:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 12:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 13:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 14:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 15:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 16:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 17:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 18:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 19:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 20:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 21:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 22:00:00+00:00 | No new entries until reset.
[21:04:44] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-05-29 23:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 00:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 01:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 02:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 03:00:00+00:00 | No new entries until reset.
[21:04:45] [PROGRESS] 68% | Bar 508/648 | 2026-06-01 04:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 04:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 05:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 06:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 07:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 08:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 09:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 10:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 11:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 12:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 13:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 14:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 15:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 16:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 17:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 18:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 19:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 20:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 21:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 22:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-01 23:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 00:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 01:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 02:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 03:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 04:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 05:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 06:00:00+00:00 | No new entries until reset.
[21:04:45] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 07:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 08:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 09:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 10:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 11:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 12:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 13:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 14:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 15:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 16:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 17:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 18:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 19:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 20:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 21:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 22:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-02 23:00:00+00:00 | No new entries until reset.
[21:04:46] [PROGRESS] 78% | Bar 552/648 | 2026-06-03 00:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 00:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 01:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 02:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 03:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 04:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 05:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 06:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 07:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 08:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 09:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 10:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 11:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 12:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 13:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 14:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 15:00:00+00:00 | No new entries until reset.
[21:04:46] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 16:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 17:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 18:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 19:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 20:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 21:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 22:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-03 23:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 00:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 01:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 02:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 03:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 04:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 05:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 06:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 07:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 08:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 09:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 10:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 11:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 12:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 13:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 14:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 15:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 16:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 17:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 18:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 19:00:00+00:00 | No new entries until reset.
[21:04:47] [PROGRESS] 88% | Bar 596/648 | 2026-06-04 20:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 20:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 21:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 22:00:00+00:00 | No new entries until reset.
[21:04:47] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-04 23:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 00:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 01:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 02:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 03:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 04:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 05:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 06:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 07:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 08:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 09:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 10:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 11:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 12:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 13:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 14:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 15:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 16:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 17:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 18:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 19:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 20:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 21:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 22:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-05 23:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 00:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 01:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 02:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 03:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 04:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 05:00:00+00:00 | No new entries until reset.
[21:04:48] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 06:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 07:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 08:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 09:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 10:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 11:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 12:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 13:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 14:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 15:00:00+00:00 | No new entries until reset.
[21:04:49] [PROGRESS] 98% | Bar 640/648 | 2026-06-08 16:00:00+00:00 | Trades: 11 | Balance: $9,796.57 (-203.43)
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 16:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 17:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 18:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 19:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 20:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 21:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 22:00:00+00:00 | No new entries until reset.
[21:04:49] [RISK ] DD LIMIT HIT 2.59% ≥ 2.00% | Bar: 2026-06-08 23:00:00+00:00 | No new entries until reset.
[21:04:49] ────────────────────────────────────────────────────────────
[21:04:49] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[21:04:49] BACKTEST COMPLETE
[21:04:49] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[21:04:49] [RESULT] Strategy : EMA Momentum Scalp
[21:04:49] [RESULT] Period : 2026-05-01 00:00:00+00:00 → 2026-06-08 23:00:00+00:00
[21:04:49] ────────────────────────────────────────────────────────────
[21:04:49] [RESULT] Total Trades : 11
[21:04:49] [RESULT] Win / Loss : 5W / 6L (Win Rate: 45.5%)
[21:04:49] ────────────────────────────────────────────────────────────
[21:04:49] [RESULT] Net P&L : $-203.43 (-2.03%)
[21:04:49] [RESULT] Gross Profit : +$312.80
[21:04:49] [RESULT] Gross Loss : -$516.23
[21:04:50] [RESULT] Profit Factor : 0.61
[21:04:50] ────────────────────────────────────────────────────────────
[21:04:50] [RESULT] Max Drawdown : $73,117.16 (149.22%)
[21:04:50] [RESULT] Sharpe Ratio : -3.78
[21:04:50] [RESULT] Expectancy : $-18.49 / trade
[21:04:50] [RESULT] Avg Duration : 1h 00m
[21:04:50] ────────────────────────────────────────────────────────────
[21:04:50] [RESULT] Best Trade : +$64.79 (Trade #5 2026-05-13 17:00:00+00:00)
[21:04:50] [RESULT] Worst Trade : -$87.67 (Trade #10 2026-05-13 22:00:00+00:00)
[21:04:50] [RESULT] Max Consec Wins : 2
[21:04:50] [RESULT] Max Consec Loss : 3
[21:04:50] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AF_BACKTEST_RUNNER_SH:~$
