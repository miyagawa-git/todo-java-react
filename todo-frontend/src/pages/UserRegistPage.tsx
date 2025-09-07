import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { http } from "@/lib/http";
import { Link } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";

type Form = {
  username: string;
  password: string;
  confirm: string; // ← フォームだけで使う
};

type RegisterPayload = {
  username: string;
  password: string; // ← サーバに送るのはこれだけ
};

export default function RegisterPage() {
  const nav = useNavigate();

  // サーバに送る型で useMutation を定義
  const reg = useMutation({
    mutationFn: async (payload: RegisterPayload) =>
      (await http.post("/api/auth/register", payload)).data,
    onSuccess: () => nav("/registerSent"),
  });

  // RHF: 確認は送らないので Form 型は別に
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    defaultValues: { username: "", password: "", confirm: "" },
    mode: "onChange", // 入力中にエラー表示したい場合
  });

  // 送信時に confirm は捨てて server payload を作る
  const onSubmit = (f: Form) =>
    reg.mutate({ username: f.username, password: f.password });

  const pwd = watch("password"); // confirm のバリデーションで参照
  // 👁 表示・非表示を切り替える状態
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
<div className="app-bg min-h-screen">
  <header className="app-container pt-8 pb-3">
        <h1>Sign up🆕👤</h1>
      </header>
      
  <main className="app-container pb-10">
    <div className="card w-full p-4 grid gap-3">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid max-w-[800px] gap-3">
      <input
        className="w-full"
        placeholder="ユーザー名"
        autoComplete="username"
        {...register("username", { required: "必須です" })}
      />
      {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
 {/* パスワード */}
    <div className="space-y-1"> 
      <div className="relative w-full">
      <input
        className="w-full pr-10" // 👁アイコン分の余白を確保
        type={showPassword ? "text" : "password"}
        placeholder="パスワード"
        autoComplete="new-password"
        {...register("password", {
          required: "必須です",
          minLength: { value: 8, message: "8文字以上にしてください" },
        })}
      />
      {/* 👁 アイコン（ボタン） */}
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </button>
      </div>
      {errors.password && (
        <p className="text-sm text-red-600">{errors.password.message}</p>
      )}
    </div>

 {/* 確認用パスワード */}
    <div className="space-y-1"> 
      <div className="relative w-full">
      <input
        className="w-full"
        type={showConfirm ? "text" : "password"}
        placeholder="パスワード（確認）"
        autoComplete="new-password"
        {...register("confirm", {
          required: "必須です",
          validate: (v) => v === pwd || "パスワードが一致しません",
        })}
      />
     {/* 👁 アイコン（ボタン） */}
      <button
        type="button"
        onClick={() => setShowConfirm((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      >
        {showConfirm ? <EyeOff /> : <Eye />}
      </button>
      </div>
      {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
      </div>

      <button disabled={isSubmitting || reg.isPending} className="btn w-full">
        アカウント作成
      </button>
        <div className="flex justify-center">
          <Link to="/login" className="btn text-center" role="button">
            ログインへ
          </Link>
        </div>
      </form>
    </div>
  </main>
</div>
  );
}
