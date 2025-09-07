import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { http } from "../lib/http";
import { Link } from "react-router-dom";

// 仕組みの要点：
// - TanStack Query(useQuery/useMutation) がサーバーI/Oの状態管理を一手に引き受ける
// - ログイン済み(= tokenあり)のときだけ一覧APIを走らせる（enabled）
// - 追加/更新/削除は useMutation → 成功時に該当queryKeyを invalidate して一覧を再フェッチ
// - フォーム送信後は react-hook-form の reset で入力欄をクリア

type Priority = 0 | 1 | 2 | 3;
export type Todo = {
  id: number;             // ★ 必須にする
  userId?: number;
  title: string;
  description?: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
  priority: Priority;
  dueDate?: string | null;
};

// フォーム専用は別型（id なし・可）
export type TodoForm = {
  title: string;
  description: string;
  done: boolean;
  priority: Priority;
  dueDate: string; // "" なら未設定
};
export default function TodoListPage() {
  // QueryClient はキャッシュの司令塔。invalidateQueries などで再フェッチを指示する
  const qc = useQueryClient();
  const token = localStorage.getItem("token");

  // 実際の取得処理。http は axios ラッパー想定で、.data に型付きレスポンスを返す
  const { data, isLoading, error } = useQuery({
    // キャッシュの識別子。サーバー応答がこのキーでキャッシュされる
    queryKey: ["todos"],
    queryFn: async () => (await http.get<Todo[]>("/api/todos")).data,
    //API呼び出しは「認証後だけ」動かす
    // 仕組み：enabled=false の間は queryFn が実行されない
    // → 未認証時に勝手に叩かない・401/403を避けるためのゲート
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { title: string; description?: string }) =>
      (await http.post("/api/todos", { ...payload, done: false })).data,
    // 仕組み：成功後に該当の queryKey を invalidate
    // → キャッシュを「古い」とマーク → 依存する useQuery が自動再フェッチ（次回再レンダリングやフォーカス時などのタイミングで自動再取得。）
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] })
  });

  const toggleMutation = useMutation({
    mutationFn: async (t: Todo) =>
      (await http.put(`/api/todos/${t.id}`, { ...t, done: !t.done })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] })
  });

  const delMutation = useMutation({
    mutationFn: async (id: number) => (await http.delete(`/api/todos/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] })
  });

  // react-hook-form：フォーム状態を管理
  // register: 各入力要素をフォーム管理下に登録
  // handleSubmit: onSubmit の前にバリデーション→データ整形
  // reset: 送信後に入力を初期化
  const { register, handleSubmit, reset } = useForm<{ title: string; description?: string ; dueDate?: ""; priority: 0;}>();
    // 仕組み：フォーム送信→ createMutation.mutate で非同期POST
  // 成功ハンドラで reset() し、上の onSuccess 連鎖で一覧が再フェッチされる
  const onSubmit = (d: { title: string; description?: string; dueDate?: ""; priority: 0}) => {
    createMutation.mutate(d, { onSuccess: () => reset() });
  };

  // 優先度用部品
  const priorityMarks = (p?: number) =>
    !p ? "" : "!".repeat(Math.max(1, Math.min(3, p)));

  const priorityLabel = (p?: number) =>
    p === 3 ? "高" : p === 2 ? "中" : p === 1 ? "低" : "なし";

  const priorityColor = (p?: number) =>
    p === 3 ? "text-red-600" :
    p === 2 ? "text-amber-600" :
    p === 1 ? "text-muted-foreground" : "text-muted-foreground";


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>エラーが発生しました</div>;

if (!token) return null;
  return (
    <div className="app-bg min-h-screen">
      <header className="app-container pt-8 pb-3">
      <h1 className="text-5xl font-semibold flex items-center gap-2"></h1>
      <h1>My Todos📝</h1>
      <br></br>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 8 }}>
        <input placeholder="タスク" {...register("title", { required: true })} />
        <textarea placeholder="備考" {...register("description")} />
        <button className="btn">追加</button>
      </form>
      </header>
    <main className="app-container pb-10">
      <div className="card">
      <ul>
        {data?.map(t => (
          <li key={t.id} style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="checkbox" checked={t.done} onChange={() => toggleMutation.mutate(t)} />
            
            <span
              className={priorityColor(t.priority)}
              aria-label={`優先度: ${priorityLabel(t.priority)}`}
            >{priorityMarks(t.priority) /* 0→"" / 1→! / 2→!! / 3→!!! */}
            </span>
            
            <Link to={`/todos/${t.id}`}
              style={ t.done ? { color: '#8895aa71', textDecoration: 'line-through' , fontSize: '1.5rem'} : { fontSize: '1.5rem' } }>
              {t.title}
            </Link>

            <div style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: "1.1rem", color: "#666" }}>{t.dueDate}    </span>
            <button className="btn" onClick={() => delMutation.mutate(t.id)}>✖</button>
            </div>
            
          </li>
        ))}
      </ul>
      </div>
    </main>

    <div className="flex justify-center">
      <button className="btn" onClick={() => { localStorage.removeItem("token"); location.href="/login"; }}>
        ログアウト
      </button>
    </div>
  </div>
  );
}
