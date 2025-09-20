import '@/api/initOpenAPI'; 
import './index.css'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import LoginPage from "./pages/LoginPage";
import TodoListPage from "./pages/TodoListPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import { Toaster } from '@/components/ui/sonner';
import RequireAuth from "./RequireAuth";
import UserRegist from "./pages/UserRegistPage";
import RegisterSent from "./pages/RegisterSent";
import Layout from "./pages/Layout";

const qc = new QueryClient();

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/userRegist", element: <UserRegist /> },
  { path: "/registerSent", element: <RegisterSent /> },
  {
    element: <RequireAuth />,//ログイン必要
      children: [
      {
        element: <Layout />, 
        children: [
        { path: "/", element: <TodoListPage /> },
        { path: "/todos/:id", element: <TodoDetailPage /> },
        ],
      },
      ]
  }
]);



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster richColors closeButton />
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);
