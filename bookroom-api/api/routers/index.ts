import Router from "koa-router";
import RouteMap from "@/routers/RouteMap";
import admin_role from "./admin/role";
import admin_user from "./admin/user";
import ai_chat from "./common/ai_chat";
import ai_graph from "./common/ai_graph";
import ai_lm_third from "./common/ai_lm_third";
import agent from "./common/agent";
import platform from "./common/platform";
// import image from "./common/image";
import file from "./common/file";
// import oauth2 from "./common/oauth2";
import login from "./common/login";
import site from "./common/site";
// import test from "./common/test";
import user_info from "./common/user_info";

import authMiddleware from "@/middlewares/auth.middleware";
import search from "./common/search";
import { USER_ROLE_ENUM } from "@/constants/RoleMap";
// import wechat from "./common/wechat";

const router = new Router();

export interface RouteItem {
  method: string;
  path: string;
  handler?: any;
  auth?: USER_ROLE_ENUM[] | null;
}

export const routerList: RouteItem[] = [
  ...admin_role,
  ...admin_user,
  ...ai_chat,
  ...ai_graph,
  ...ai_lm_third,
  ...agent,
  ...platform,
  ...file,
  // ...image,
  ...login,
  // ...oauth2,
  ...site,
  // ...test,
  ...search,
  ...user_info,
  // ...wechat
];

routerList.forEach((item: any) => {
  // 根据item的method来注册路由
  switch (item.method) {
    case "GET":
      router.get(item.path, authMiddleware(item.path), item.handler);
      break;
    case "POST":
      router.post(item.path, authMiddleware(item.path), item.handler);
      break;
    case "PUT":
      router.put(item.path, authMiddleware(item.path), item.handler);
      break;
    case "DELETE":
      router.delete(item.path, authMiddleware(item.path), item.handler);
  }
});

export default router;