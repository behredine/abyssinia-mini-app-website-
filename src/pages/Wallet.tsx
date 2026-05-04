import { useCallback, useEffect, useState } from "react";
import { Coins, RefreshCw, TrendingUp } from "lucide-react";
import { api, type Wallet as WalletResponse } from "../lib/api";

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setWallet(await api.wallet());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not refresh wallet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="page-stack">
      <section className="wallet-card">
        <span className="eyebrow">Wallet</span>
        <div className="wallet-total">
          <Coins size={30} />
          <strong>{isLoading ? "..." : wallet?.coins.toLocaleString() ?? "0"}</strong>
        </div>
        <p>Current coins ready under backend rules.</p>
        <button className="secondary-button" onClick={refresh} disabled={isLoading}>
          <RefreshCw className={isLoading ? "spin" : ""} size={18} />
          Refresh
        </button>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <span>Pending Coins</span>
          <strong>{wallet?.pendingCoins?.toLocaleString() ?? "0"}</strong>
        </article>
        <article className="metric-card">
          <span>Lifetime</span>
          <strong>{wallet?.lifetimeCoins?.toLocaleString() ?? "0"}</strong>
        </article>
      </section>

      <section className="action-strip">
        <TrendingUp size={22} />
        <div>
          <strong>Live balance</strong>
          <p>Refresh after completing rewards to sync your wallet.</p>
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
