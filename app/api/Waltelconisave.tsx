import Api from './Api';

export type UserId = string | number;

export const COIN_EVENT = 'coin-updated';

/* ---------- Safe localStorage helpers ---------- */

export const getStoredUserId = (): UserId | null => {
  if (typeof window === 'undefined') return null;
  try {
    const users = JSON.parse(localStorage.getItem('userData') || '[]');
    return users?.[0]?.id ?? null;
  } catch {
    return null;
  }
};

export const saveCoinLocally = (coin: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('coin', String(coin));
  // Let other components (navbar, wallet page...) update instantly
  window.dispatchEvent(new CustomEvent(COIN_EVENT, { detail: coin }));
};

/* ---------- Error helper ---------- */

export const getErrorMessage = (error: unknown): string => {
  const e = error as any;
  return (
    e?.response?.data?.message ||
    e?.message ||
    'কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন।'
  );
};

/* ---------- Wallet API ---------- */

export const walletService = {
  /** Get current coin balance from the server */
  async getCoin(userId: UserId, signal?: AbortSignal): Promise<number> {
    const { data } = await Api.get(`/wallate_get/${userId}`, { signal });
    return Number(data?.data?.[0]?.coin ?? 0);
  },

  /** Add coin reward. Amount should be validated on the server too. */
  async addCoin(userId: UserId, coin: number, source = 'home_icon_coine') {
    const { data } = await Api.post('/add_coin', {
      user_id: userId,
      coin: String(coin),
      home_coin: source,
    });
    return data as { status: boolean; message?: string };
  },
};

/* ---------- Daily claim helpers (one reward per day) ---------- */

// Local date, e.g. "2026-11-06". Changes at the user's midnight.
export const getTodayKey = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const claimKey = (userId: UserId) => `creature_claim_${userId}`;

export const hasClaimedToday = (userId: UserId | null): boolean => {
  if (!userId || typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(claimKey(userId)) === getTodayKey();
  } catch {
    return false;
  }
};

export const markClaimedToday = (userId: UserId) => {
  try {
    localStorage.setItem(claimKey(userId), getTodayKey());
  } catch {
    /* storage unavailable – ignore */
  }
};