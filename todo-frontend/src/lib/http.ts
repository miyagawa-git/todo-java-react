import axios from "axios";
//生成された API クライアント側で axios を差し替え
//（生成物に HttpClient 等があれば baseURL/headers をこの http に合わせる。
//axios を直接使う生成設定の場合は、グローバル axios を上書きでもOK）
export const http = axios.create({
  // baseURL: "http://localhost:8081",
  // baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081",
    // Cookieベースでないなら false のままでOK
    baseURL: import.meta.env.DEV
    ? "/"                              // ← dev は相対に固定（proxyに乗る）
    : import.meta.env.VITE_API_BASE_URL, // 本番は環境変数から
  withCredentials: false,
});

// 認証が必要なパス判定を「絶対URL」基準で行う
const needsAuth = (url?: string): boolean => {
  if (!url) return false;
//   const u = new URL(url, http.defaults.baseURL);
  // baseURL が相対（"/"など）の場合(dev時）は window.location.origin(http://localhost:5173) を使う
  const base =
    http.defaults.baseURL && /^https?:\/\//i.test(http.defaults.baseURL)
      ? http.defaults.baseURL
      : window.location.origin;
      const u = new URL(url, base);
      const p = u.pathname;
  // 公開パスは除外
  if (p.startsWith("/auth/")) return false;
  if (p.startsWith("/v3/") || p.startsWith("/swagger-ui")) return false;
  // API配下のみ付与
  return p.startsWith("/api/");
};

http.interceptors.request.use((config) => {
  if (needsAuth(config.url)) {
    // 保存時に "Bearer xxx" としている場合に備え、重複 Bearer を除去して正規化
    const raw = localStorage.getItem("token") ?? "";
    const token = raw.replace(/^Bearer\s+/i, "");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        alert("再ログインしてください。"); // ✅ 401時の表示
        localStorage.removeItem("token");
        window.location.href = "/login";
        return new Promise(() => {}); // 以降の処理を止める
      }
      if (err.response.status === 403) {
        alert("ユーザー認証に失敗しました。"); // ✅ 403時の表示
        localStorage.removeItem("token");
        window.location.href = "/login";
        return new Promise(() => {});
      }
    }
    return Promise.reject(err);
  }
);