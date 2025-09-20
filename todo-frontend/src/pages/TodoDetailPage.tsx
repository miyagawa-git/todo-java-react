import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { useEffect } from "react";
import { http } from "../lib/http";

import type { Todo } from "@/api/models/Todo";

export default function TodoDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  
// 1)まずはデータを取得
  const { data } = useQuery({
    queryKey: ["todo", id],
    queryFn: async () => (await http.get<Todo>(`/api/todos/${id}`)).data
  });
  // 2) フォームを用意：defaultValues でformを空で開始
  // コンポーネントが最初に表示された瞬間、サーバーのデータはまだ無いため（data は undefined）
  const { register, handleSubmit, reset} = useForm<Todo>({
    defaultValues: { title: "", description: "", done: false ,priority: 0,  dueDate: "",},
  });

  // 3) データ取得が完了したら、その値でフォームを上書き
  // useQuery がサーバーから data を取ってくると、後からコンポーネントが再描画される
  // そのタイミングを useEffect でフックして、reset(data) を呼ぶと、
  // React Hook Form がフォーム内の値を一括で更新してくれる
  useEffect(() => {
   if (data ) reset(data);
  }, [data, reset]);

  // 4) 更新API（保存）
  const update = useMutation({
    mutationFn: async (d: Todo) => (await http.put(`/api/todos/${id}`, d)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      nav("/");
    },
  });

  if (!data) return <div>Loading...</div>;

  return (
    <div className="app-bg min-h-screen">
      <header className="app-container pt-8 pb-3">
      <h1>Edit Todo✏️</h1><br></br>
      </header>
                    
      <main className="app-container pb-10">
    <div className="card">
      <form onSubmit={handleSubmit((d)=>update.mutate(d))} style={{ display:"grid", gap:8 }}>
        <input placeholder="タスク" {...register("title", { required: true })} />
        <textarea  placeholder="備考" {...register("description")} />

      <div className="flex items-center gap-2">
        <label htmlFor="priority" className="text-sm font-medium text-gray-700">
          優先度：
        </label>
        <select
        {...register("priority", { valueAsNumber: true })}
          className="border border-gray-300 rounded-md px-2 py-1"
        >
        <option value={0}>（なし）</option>
          <option value={1}>低</option>
          <option value={2}>中</option>
          <option value={3}>高</option>
        </select>
      </div>
        <div style={{ display:"flex", gap:8 }}>
          <button type="submit" className="btn">保存💾</button>
          <button type="button" className="btn" onClick={()=>reset(data)}>リセット🔄</button>
          <button type="submit" className="btn" onClick={()=>reset(data)}>戻る↩️</button>
        </div>
      </form>
    </div>
    </main>
    </div>

  );
}
