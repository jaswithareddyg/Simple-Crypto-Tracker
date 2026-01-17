// Virtual scrolling engine
class VirtualScroller {
  constructor(viewport, itemHeight) {
    this.viewport = viewport;
    this.itemHeight = itemHeight;
    this.items = [];
    this.filteredItems = [];
    this.visibleArea = document.getElementById("visibleArea");
    this.scrollContent = document.getElementById("scrollContent");
    this.overscan = 3;

    this.lastScrollTop = 0;

    this.viewport.addEventListener("scroll", () => {
      if (this.viewport.scrollTop !== this.lastScrollTop) {
        this.lastScrollTop = this.viewport.scrollTop;
        this.render();
      }
    });
  }

  setItems(items) {
    this.items = items;
    this.filteredItems = items;
    this.scrollContent.style.height = `${items.length * this.itemHeight}px`;
    this.render();
  }

  filter(predicate) {
    this.filteredItems = this.items.filter(predicate);
    this.scrollContent.style.height = `${this.filteredItems.length * this.itemHeight}px`;
    this.viewport.scrollTop = 0;
    this.render();
  }

  render() {
    const scrollTop = this.viewport.scrollTop;
    const viewportHeight = this.viewport.clientHeight;

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / this.itemHeight) - this.overscan,
    );
    const endIndex = Math.min(
      this.filteredItems.length,
      Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + this.overscan,
    );

    const visibleItems = this.filteredItems.slice(startIndex, endIndex);

    this.visibleArea.style.top = `${startIndex * this.itemHeight}px`;
    this.visibleArea.innerHTML = visibleItems
      .map((item) => this.renderItem(item))
      .join("");

    document.getElementById("renderedCount").textContent = visibleItems.length;
    document.getElementById("totalCount").textContent =
      this.filteredItems.length;
  }

  renderItem(coin) {
    const changeClass =
      coin.price_change_percentage_24h >= 0
        ? "change-positive"
        : "change-negative";
    const changeSymbol = coin.price_change_percentage_24h >= 0 ? "↑" : "↓";

    return `
                    <div class="crypto-card">
                        <div class="crypto-icon">
                            <img src="${coin.image}" alt="${coin.name}" width="48" height="48" style="border-radius: 50%;">
                        </div>
                        <div class="crypto-info">
                            <div class="crypto-name">${coin.name}</div>
                            <div class="crypto-symbol">${coin.symbol}</div>
                            <div class="market-cap">Rank #${coin.market_cap_rank || "N/A"}</div>
                        </div>
                        <div class="crypto-stats">
                            <div class="stat-item">
                                <div class="stat-label-small">Price</div>
                                <div class="stat-value-large">$${coin.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label-small">24h Volume</div>
                                <div class="stat-value-large">$${(coin.total_volume / 1e9).toFixed(2)}B</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label-small">Market Cap</div>
                                <div class="stat-value-large">$${(coin.market_cap / 1e9).toFixed(2)}B</div>
                            </div>
                            <div class="change-badge ${changeClass}">
                                ${changeSymbol} ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                `;
  }
}

// Initialize
const scroller = new VirtualScroller(document.getElementById("viewport"), 100);
let allCoins = [];
let isLoading = false;

// Load cryptocurrency data from CoinGecko API
async function loadCoins(count) {
  if (isLoading) return;

  isLoading = true;
  const buttons = ["btn50", "btn100", "btn250"];
  buttons.forEach((id) => (document.getElementById(id).disabled = true));

  document.getElementById("visibleArea").innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <div>Loading ${count} cryptocurrencies from CoinGecko...</div>
                </div>
            `;

  const startTime = performance.now();

  try {
    const perPage = 250;
    const pages = Math.ceil(count / perPage);
    const promises = [];

    for (let page = 1; page <= pages; page++) {
      promises.push(
        fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`,
        ).then((res) => res.json()),
      );
    }

    const results = await Promise.all(promises);
    allCoins = results.flat().slice(0, count);

    const endTime = performance.now();
    document.getElementById("loadTime").textContent =
      `${(endTime - startTime).toFixed(0)}ms`;

    scroller.setItems(allCoins);
    updateStats();
  } catch (error) {
    document.getElementById("visibleArea").innerHTML = `
                    <div class="error">
                        <h3>Error loading data</h3>
                        <p>${error.message}</p>
                        <p style="margin-top: 1rem; color: var(--text-secondary);">
                            CoinGecko API might be rate-limited. Try again in a minute.
                        </p>
                    </div>
                `;
  }

  isLoading = false;
  buttons.forEach((id) => (document.getElementById(id).disabled = false));
}

function updateStats() {
  const avgChange =
    allCoins.reduce((sum, c) => sum + c.price_change_percentage_24h, 0) /
    allCoins.length;

  document.getElementById("totalCoins").textContent =
    allCoins.length.toLocaleString();
  document.getElementById("visibleCoins").textContent =
    scroller.filteredItems.length.toLocaleString();
  document.getElementById("avgChange").textContent = avgChange.toFixed(2) + "%";
  document.getElementById("avgChange").style.color =
    avgChange >= 0 ? "var(--accent-good)" : "var(--accent-critical)";
}

function filterCoins() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  if (query === "") {
    scroller.filter(() => true);
  } else {
    scroller.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.symbol.toLowerCase().includes(query),
    );
  }
  updateStats();
}

function refreshData() {
  const currentCount = allCoins.length;
  if (currentCount > 0) {
    loadCoins(currentCount);
  }
}

// Auto-load top 50 on page load
window.addEventListener("load", () => {
  setTimeout(() => loadCoins(50), 500);
});
