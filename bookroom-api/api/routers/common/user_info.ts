import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import UserInfoController from "@/controller/UserInfoController";
import routeMap from "@/routers/RouteMap";


const routerList = [
  {
    path: routeMap.INITIAL,
    method: "GET",
    handler: UserInfoController.initial,
    auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
  },
  {
    path: routeMap.LOGOUT,
    method: "POST",
    handler: UserInfoController.logout,
    auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
  },
  {
    path: routeMap.PWD,
    method: "POST",
    handler: UserInfoController.pwd,
    auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
  },
];

export default routerList;
