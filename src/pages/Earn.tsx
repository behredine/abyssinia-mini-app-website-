import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Clapperboard, Crown, ExternalLink, Loader2 } from "lucide-react";
import { api, getStoredToken, type EarnSource, type EarnStartResponse } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { telegram } from "../lib/telegram";

type EarnCard = {
  source: EarnSource;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const EARN_CARDS: EarnCard[] = [
  {
    source: "adsgram",
    title: "Premium Tasks",
    description: "Higher-value actions for focused earners.",
    icon: <Crown size={24} />,
  },
  {
    source: "monetag",
    title: "Watch Ads",
    description: "Quick video rewards when inventory is available.",
    icon: <Clapperboard size={24} />,
  },
];

export default function Earn() {
  const { token, refreshAuth } = useAuth();
  const [activeSource, setActiveSource] = useState<EarnSource | null>(null);
  const [claim, setClaim] = useState<EarnStartResponse | null>(null);
  const [availableSources, setAvailableSources] = useState<Set<EarnSource>>(new Set(EARN_CARDS.map((card) => card.source)));
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const claimReady = useMemo(() => Boolean(claim?.claimMode && claim?.token), [claim]);

  useEffect(() => {
    api
      .earnOptions()
      .then((options) => {
        const allowed = new Set<EarnSource>();
        options.forEach((option) => {
          if ((option.source === "adsgram" || option.source === "monetag") && option.available !== false) {
            allowed.add(option.source);
          }
        });
        setAvailableSources(allowed.size ? allowed : new Set(EARN_CARDS.map((card) => card.source)));
      })
      .catch(() => {
        setAvailableSources(new Set(EARN_CARDS.map((card) => card.source)));
      });
  }, []);

  async function start(source: EarnSource) {
    setActiveSource(source);
    setError(null);
    setMessage(null);
    setClaim(null);

    try {
      if (!token) {
        await refreshAuth();
      }

      if (!getStoredToken()) {
        throw new Error("Your session is not connected yet. Reopen this Mini App from the bot menu, then try Watch Ads again.");
      }

      const response = await api.startEarn(source);
      setClaim(response);
      telegram.openExternal(response.openUrl);
    } catch (caught) {
      telegram.error();
      setError(caught instanceof Error ? caught.message : "Could not start earning");
    } finally {
      setActiveSource(null);
    }
  }

  async function complete() {
    if (!claim?.token) return;

    setClaiming(true);
    setError(null);
    setMessage(null);

    try {
      const response = await api.claimEarn(claim.token);
      telegram.success();
      setMessage(response.message ?? `Reward claimed${response.coins ? `: ${response.coins} coins` : ""}.`);
      setClaim(null);
    } catch (caught) {
      telegram.error();
      setError(caught instanceof Error ? caught.message : "Reward is not ready yet");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="page-stack">
      <section>
        <span className="eyebrow">Earn</span>
        <h2 className="page-title">Choose your reward lane</h2>
      </section>

      <div className="earn-grid">
        {EARN_CARDS.map((card) => (
          <button
            className="earn-card"
            key={card.source}
            onClick={() => start(card.source)}
            disabled={Boolean(activeSource) || !availableSources.has(card.source)}
          >
            <span className="earn-icon">{card.icon}</span>
            <span>
              <strong>{card.title}</strong>
              <small>{card.description}</small>
            </span>
            {activeSource === card.source ? <Loader2 className="spin" size={20} /> : <ExternalLink size={19} />}
          </button>
        ))}
      </div>

      {claimReady && (
        <section className="claim-panel">
          <BadgeCheck size={24} />
          <div>
            <strong>Task opened</strong>
            <p>Return here after finishing to request your reward.</p>
          </div>
          <button className="primary-button compact" onClick={complete} disabled={claiming}>
            {claiming ? "Checking..." : "I Completed It"}
          </button>
        </section>
      )}

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
