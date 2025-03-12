import UserController from "@/controller/UserController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.ADMIN_USER,
        method: "GET",
        handler: UserController.queryUserList,
    },
    {
        path: routeMap.ADMIN_USER_DETAIL,
        method: "GET",
        handler: UserController.getUserDetail,
    },
    {
        path: routeMap.ADMIN_USER_STATUS,
        method: "PUT",
        handler: UserController.changeUserStatus,
    },
    {
        path: routeMap.ADMIN_USER_DETAIL,
        method: "PUT",
        handler: UserController.changeUserInfo,
    },
    {
        path: routeMap.ADMIN_USER_DETAIL,
        method: "DELETE",
        handler: UserController.deleteUser,
    },
];
export default routerList;