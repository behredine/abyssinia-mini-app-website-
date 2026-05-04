import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { api, type Wallet } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .wallet()
      .then(setWallet)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load wallet"))
      .finally(() => setIsLoading(false));
  }, []);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Member";

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h2>{displayName}</h2>
          <p>{token ? "Premium rewards, verified through your Telegram session." : "Premium rewards ready when your session is available."}</p>
        </div>
        <div className="coin-orbit">
          <Sparkles size={26} />
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <span>Available Coins</span>
          <strong>{isLoading ? "..." : wallet?.coins.toLocaleString() ?? "0"}</strong>
        </article>
        <article className="metric-card">
          <span>Pending</span>
          <strong>{isLoading ? "..." : wallet?.pendingCoins?.toLocaleString() ?? "0"}</strong>
        </article>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="action-strip">
        <ShieldCheck size={22} />
        <div>
          <strong>Secure session active</strong>
          <p>{token ? "Protected requests use your Telegram-backed token." : "Open from the bot menu to sync your protected balance."}</p>
        </div>
        {isLoading && <RefreshCw className="spin" size={18} />}
      </section>
    </div>
  );
}
