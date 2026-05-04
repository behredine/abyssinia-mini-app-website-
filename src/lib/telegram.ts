type TelegramThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
};

type TelegramWebApp = {
  initData: string;
  version?: string;
  platform?: string;
  colorScheme?: "light" | "dark";
  themeParams?: TelegramThemeParams;
  ready: () => void;
  expand: () => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const telegram = {
  get webApp() {
    return window.Telegram?.WebApp;
  },

  getInitData() {
    return window.Telegram?.WebApp?.initData || getLaunchParamInitData();
  },

  async waitForInitData(timeoutMs = 2200) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const initData = telegram.getInitData();

      if (initData) {
        return initData;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }

    return telegram.getInitData();
  },

  boot() {
    const app = window.Telegram?.WebApp;
    app?.ready();
    app?.expand();
  },

  openExternal(url: string) {
    const app = window.Telegram?.WebApp;

    if (app?.openLink) {
      app.openLink(url, { try_instant_view: false });
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  },

  success() {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
  },

  error() {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
  },
};

function getLaunchParamInitData() {
  const sources = [window.location.hash, window.location.search]
    .filter(Boolean)
    .map((value) => (value.startsWith("#") || value.startsWith("?") ? value.slice(1) : value));

  for (const source of sources) {
    const params = new URLSearchParams(source);
    const initData = params.get("tgWebAppData");

    if (initData) {
      return initData;
    }
  }

  return "";
}
