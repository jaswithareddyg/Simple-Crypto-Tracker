# 🚀 Crypto Market Tracker (Virtual Scrolling Demo)

A high-performance **crypto market tracker** built with **vanilla HTML, CSS, and JavaScript**, demonstrating:

- ⚡ Virtual scrolling for large datasets  
- 🔴 Live data from the **CoinGecko API**  
- ↔️ Horizontal + vertical scrolling without reflow glitches  
- 📊 Real-time stats and filtering  
- 🎯 Zero frameworks, zero build tools

This project is designed as a **frontend performance demo** rather than a full trading app.


## ✨ Features

- **Live market data**
  - Prices, market cap, volume, 24h change
  - Data fetched directly from CoinGecko

- **Virtual scrolling**
  - Only visible rows are rendered
  - Smooth performance even with 250+ coins
  - Overscan support for natural scrolling

- **Horizontal scrolling**
  - Wide cards with rich data
  - No flicker or DOM thrashing
  - Scroll independently from vertical virtualization

- **Search & filtering**
  - Filter by coin name or symbol
  - Instant client-side filtering

- **Performance metrics**
  - Load time tracking
  - Rendered vs total item count
  - Visual confirmation of virtualization


## 🧠 How Virtual Scrolling Works

- Each row has a **fixed height** (`100px`)
- The container height simulates the full list
- Only visible items + overscan are rendered
- On vertical scroll:
  - Calculate visible index range
  - Rebuild DOM only for that slice

- Horizontal scrolling **does not trigger re-rendering**, preventing flicker.


## 🛠️ Tech Stack

- **HTML5**
- **CSS3** (Grid, custom scrollbars, animations)
- **Vanilla JavaScript (ES6+)**
- **CoinGecko REST API**

No frameworks. No dependencies.


## 📁 Project Structure
    ├── index.html
    ├── LICENSE
    ├── README.md
    ├── script.js
    └── style.css

## 🔄 CoinGecko API

This app uses the following endpoint:

```bash
GET https://api.coingecko.com/api/v3/coins/markets
```

### Query Parameters

- `vs_currency=usd`
- `order=market_cap_desc`
- `per_page=250`
- `sparkline=false`

### Rate Limits

- CoinGecko enforces rate limits on free API usage.  
- If requests fail or return errors, wait approximately **1 minute** before retrying.
