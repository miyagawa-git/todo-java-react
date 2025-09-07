import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";

import { useEffect } from "react";
import { http } from "../lib/http";
import { Checkbox } from "@/components/ui/checkbox.tsx";

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
  const { register, handleSubmit, reset, control} = useForm<Todo>({
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

      <form onSubmit={handleSubmit((d)=>update.mutate(d))} style={{ display:"grid", gap:8 }}>
        <input {...register("title", { required: true })} />
        <textarea {...register("description")} />

      <div className="flex items-center space-x-2">
      <div className="flex items-center gap-2">
        <select
        {...register("priority", { valueAsNumber: true })}
          className="w-full"
        >
        <option value={0}>（なし）</option>
          <option value={1}>低</option>
          <option value={2}>中</option>
          <option value={3}>高</option>
        </select>
        <Controller
          name="done"
          control={control}
          render={({ field }) => (
            <>
              {/* label で包まず、きょうだいにする // checked={!!field.value}*/}
              
              <Checkbox
                id="done"
                className="cb-emerald"
                type="button"
                checked={field.value === true}
                onCheckedChange={(v) => field.onChange(v === true)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
              <label htmlFor="done" className="select-none cursor-pointer">
                 {field.value ? " 完了" : " 未完了"}
              </label>
            </>
          )}
        />
      </div>
      </div>

        <div style={{ display:"flex", gap:8 }}>
          <button type="submit" className="btn">保存💾</button>
          <button type="button" className="btn" onClick={()=>reset(data)}>リセット🔄</button>
          <button type="submit" className="btn" onClick={()=>reset(data)}>戻る↩️</button>
        </div>
      </form>

    </div>
  );
}
