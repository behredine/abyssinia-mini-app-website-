export type EarnSource = "adsgram" | "monetag";

export type User = {
  id: string | number;
  telegramId?: string | number;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  level?: string;
};

export type Wallet = {
  coins: number;
  pendingCoins?: number;
  lifetimeCoins?: number;
};

export type AuthResponse = {
  token: string;
  user?: User;
};

export type EarnOption = {
  source: EarnSource;
  title?: string;
  description?: string;
  rewardCoins?: number;
  available?: boolean;
};

export type EarnStartResponse = {
  openUrl: string;
  token?: string;
  claimMode?: "manual" | "auto" | string;
  expiresAt?: string;
};

export type EarnClaimResponse = {
  success: boolean;
  coins?: number;
  wallet?: Wallet;
  message?: string;
};

type RequestOptions = RequestInit & {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

let memoryToken: string | null = localStorage.getItem("telegram_rewards_token");
let unauthorizedHandler: (() => Promise<void>) | null = null;

export function getStoredToken() {
  return memoryToken;
}

export function setStoredToken(token: string | null) {
  memoryToken = token;

  if (token) {
    localStorage.setItem("telegram_rewards_token", token);
  } else {
    localStorage.removeItem("telegram_rewards_token");
  }
}

export function onUnauthorized(handler: () => Promise<void>) {
  unauthorizedHandler = handler;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, retryOnUnauthorized = true, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL");
  }

  if (!requestHeaders.has("Content-Type") && init.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth && memoryToken) {
    requestHeaders.set("Authorization", `Bearer ${memoryToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: requestHeaders,
  });

  if (response.status === 401 && retryOnUnauthorized) {
    setStoredToken(null);
    await unauthorizedHandler?.();
    return request<T>(path, { ...options, retryOnUnauthorized: false });
  }

  if (!response.ok) {
    const error = await readError(response);
    throw new Error(error || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function readError(response: Response) {
  try {
    const body = await response.json();
    return body.message ?? body.error ?? JSON.stringify(body);
  } catch {
    return response.statusText;
  }
}

export const api = {
  authTelegram(initData: string) {
    return request<AuthResponse>("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ initData }),
      auth: false,
      retryOnUnauthorized: false,
    });
  },

  me() {
    return request<User>("/api/me");
  },

  wallet() {
    return request<Wallet>("/api/wallet");
  },

  earnOptions() {
    return request<EarnOption[]>("/api/earn/options");
  },

  startEarn(source: EarnSource) {
    return request<EarnStartResponse>("/api/earn/start", {
      method: "POST",
      body: JSON.stringify({ source }),
    });
  },

  claimEarn(token: string) {
    return request<EarnClaimResponse>("/api/earn/claim", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },
};
