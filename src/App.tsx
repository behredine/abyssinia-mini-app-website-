import type React from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { Gift, Home, Landmark, WalletCards } from "lucide-react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Earn from "./pages/Earn";
import Wallet from "./pages/Wallet";
import Withdraw from "./pages/Withdraw";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="app-shell centered">
        <div className="brand-mark">R</div>
        <p className="muted">Securing your session...</p>
        <div className="loader" />
      </main>
    );
  }

  return children;
}

function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Rewards</span>
          <h1>GoldLine</h1>
        </div>
        <div className="status-dot" aria-label="Secure session" />
      </header>

      <section className="page-frame">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </section>

      <nav className="bottom-nav" aria-label="Main navigation">
        <NavLink to="/" end>
          <Home size={19} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/earn">
          <Gift size={19} />
          <span>Earn</span>
        </NavLink>
        <NavLink to="/wallet">
          <WalletCards size={19} />
          <span>Wallet</span>
        </NavLink>
        <NavLink to="/withdraw">
          <Landmark size={19} />
          <span>Withdraw</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate>
          <Layout />
        </AuthGate>
      </AuthProvider>
    </BrowserRouter>
  );
}
