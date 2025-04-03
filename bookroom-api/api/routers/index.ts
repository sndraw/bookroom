import Router from "koa-router";
import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import authMiddleware from "@/middlewares/auth.middleware";
import admin_role from "./admin/role";
import admin_user from "./admin/user";
import ai_chat from "./common/ai_chat";
import ai_graph from "./common/ai_graph";
import ai_lm from "./common/ai_lm";
import agent from "./common/agent";
import platform from "./common/platform";
import file from "./common/file";
import login from "./common/login";
import site from "./common/site";
import user_info from "./common/user_info";
import search from "./common/search";
import voice from "./common/voice";
// import image from "./common/image";
// import oauth2 from "./common/oauth2";
// import wechat from "./common/wechat";
// import test from "./common/test";



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
  ...ai_lm,
  ...agent,
  ...platform,
  ...file,
  ...login,
  ...site,
  ...search,
  ...user_info,
  ...voice,
  // ...image,
  // ...oauth2,
  // ...wechat
  // ...test,

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