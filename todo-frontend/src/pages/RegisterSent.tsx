// src/pages/RegisterSent.tsx
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterSent() {
  const nav = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => nav("/login"), 2500); // 2.5秒後にログインへ
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div className="app-bg min-h-screen">
      <main className="app-container py-10">
        <div className="card max-w-[520px] mx-auto text-center grid gap-4">
          <div role="status" aria-live="polite" className="text-2xl">
            ✅ 会員登録が完了しました
          </div>
          <p className="text-sm text-muted-foreground">
            まもなくログインページへ移動します…
          </p>

          {/* 手動遷移用のボタン（自動遷移の保険） */}
          <Link to="/login" className="btn w-full inline-block text-center">
            ログインへ進む
          </Link>
        </div>
      </main>
    </div>
  );
}
