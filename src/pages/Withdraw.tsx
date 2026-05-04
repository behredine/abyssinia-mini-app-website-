import { Landmark, LockKeyhole } from "lucide-react";

export default function Withdraw() {
  return (
    <div className="page-stack">
      <section className="withdraw-card">
        <div className="withdraw-icon">
          <Landmark size={30} />
        </div>
        <span className="eyebrow">Withdraw</span>
        <h2>Bot-controlled payouts</h2>
        <p>Withdraw is handled by bot/backend rules.</p>
      </section>

      <section className="action-strip">
        <LockKeyhole size={22} />
        <div>
          <strong>Protected flow</strong>
          <p>Payout checks, limits, and approval logic stay on the server.</p>
        </div>
      </section>
    </div>
  );
}
