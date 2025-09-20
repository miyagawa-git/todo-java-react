import { Link } from "react-router-dom";

type Props = { username?: string };

export default function TopBar({ username }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 bg-card border-b border-border shadow-sm z-50">
      <div className="mx-auto max-w-[840px] px-4 h-14 flex items-center justify-between">
        {/* 左：ホーム */}
        <Link
          to="/"
          className="flex items-center gap-2 text-foreground hover:opacity-80 transition"
          aria-label="ホームへ"
        >
          <span className="text-xl font-semibold">Home🏠</span>
        </Link>
        {/* 右：ユーザ名｜ログアウト */}
        <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="text-xl font-medium text-foreground">{username ?? "ゲスト"}</span>
            <span className="text-xs">さん </span>
            <span className="text-muted-foreground">|</span>
            <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => {
                localStorage.removeItem("token");
                location.href = "/login";
                }}
            >
                ログアウト
            </button>
            </div>
      </div>
    </header>
  );
}
