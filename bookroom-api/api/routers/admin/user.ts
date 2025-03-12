import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import UserController from "@/controller/UserController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.ADMIN_USER,
        method: "GET",
        handler: UserController.queryUserList,
        auth: [USER_ROLE_ENUM.OPS]
    },
    {
        path: routeMap.ADMIN_USER_DETAIL,
        method: "GET",
        handler: UserController.getUserDetail,
        auth: [USER_ROLE_ENUM.OPS]
    },
    {
        path: routeMap.ADMIN_USER_STATUS,
        method: "PUT",
        handler: UserController.changeUserStatus,
        auth: [USER_ROLE_ENUM.OPS]
    },
    {
        path: routeMap.ADMIN_USER_DETAIL,
        method: "PUT",
        handler: UserController.changeUserInfo,
        auth: [USER_ROLE_ENUM.OPS]
    },
    {
        path: routeMap.ADMIN_USER_DETAIL,
        method: "DELETE",
        handler: UserController.deleteUser,
        auth: [USER_ROLE_ENUM.OPS]
    },
];
export default routerList;