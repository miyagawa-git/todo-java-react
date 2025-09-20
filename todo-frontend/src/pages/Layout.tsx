import { Outlet, Navigate } from "react-router-dom";
import TopBar from "./TopBar";

export default function Layout() {
//   const username = localStorage.getItem("username"); // 例：ログイン時に保存
const username = localStorage.getItem("username") ; 
  if (!username) {
    // 未ログインならログイン画面へリダイレクト
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={username} />
      <main className="pt-14">
        <Outlet /> {/* ログイン後のページ */}
      </main>
    </div>
  );
}
