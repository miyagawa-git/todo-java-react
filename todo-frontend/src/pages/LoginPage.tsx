import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { http } from "../lib/http";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Form = { username: string; password: string };

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>();
  const nav = useNavigate();

  const onSubmit = async (d: Form) => {
    // const res = await axios.post("/api/auth/login", d);
    const res = await http.post("/api/auth/login", d);
    localStorage.setItem("token", res.data.token);
    nav("/");
  };
   // 👁 表示・非表示を切り替える状態
    const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="app-bg min-h-screen">
      <header className="app-container pt-8 pb-3">
      <h1>Login🔑</h1><br></br>
      </header>

      <main className="app-container pb-10">
      <div className="card w-full p-4 grid gap-3">
      <form onSubmit={handleSubmit(onSubmit)}
      className="mx-auto grid max-w-[800px] gap-3">
        <input 
        autoComplete="username"
        placeholder="ユーザー名" {...register("username", { required: true })}className="w-full" />
        {errors.username && <div>必須です</div>}

         {/* パスワード */}
    <div className="space-y-1"> 
      <div className="relative w-full">
        <input type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="パスワード" {...register("password", { required: true })} className="w-full"/>
        {errors.password && <div>必須です</div>}


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
        <br></br>
        <div className="flex justify-center">
        <button className="btn" disabled={isSubmitting}>ログイン</button >
        </div>
        
        <div className="flex justify-center">
        <Link to="/userRegist" className="btn text-center" role="button">
          新規登録へ
        </Link></div>

      </form>
      </div>

      </main>
    </div>
  );
}
