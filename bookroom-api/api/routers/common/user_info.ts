import UserInfoController from "@/controller/UserInfoController";
import routeMap from "@/constants/RouteMap";


const routerList = [
  {
    path: routeMap.INITIAL,
    method: "GET",
    handler: UserInfoController.initial,
  },
  {
    path: routeMap.LOGOUT,
    method: "POST",
    handler: UserInfoController.logout,
  },
  {
    path: routeMap.PWD,
    method: "POST",
    handler: UserInfoController.pwd,
  },
];

export default routerList;
