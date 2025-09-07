// 実行時に BASE を上書きして環境ごとに切り替え可能に
import { OpenAPI } from '@/api/core/OpenAPI';

OpenAPI.BASE = import.meta.env.DEV
  ? '/api'                                   // dev は 5173→proxy→（/api剥がし）→8081
  : (import.meta.env.VITE_API_BASE_URL ?? '/'); // 本番は直叩き用の起点URL

// 認証ヘッダ（生成クライアントに自動付与）
// OpenAPI.TOKEN = async () => {
//   const raw = localStorage.getItem('token') ?? '';
//   const t = raw.replace(/^Bearer\s+/i, '');
//   return t || undefined;
// };

OpenAPI.WITH_CREDENTIALS = false; // Cookie 認証なら true
