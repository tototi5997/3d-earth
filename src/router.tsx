import { HashRouter, BrowserRouter, RouteObject, Navigate } from "react-router-dom";
import Home from "./pages/home";
import NotFoundPage from "./pages/404";
import TestTween from "./pages/test-tween";

export type RouterType = "hash" | "browser";

// 当前路由模式
const ROUTER_TYPE: RouterType = "browser";

// 路由类型
const routerMap = {
  hash: HashRouter,
  browser: BrowserRouter,
};

export const RouterComponent = routerMap[ROUTER_TYPE];

// 路由配置
export const routerConfig: RouteObject[] = [
  { path: "/", element: <Navigate to="/home" replace /> },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/test",
    element: <TestTween />,
  },
  // 404 放在最下面
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
