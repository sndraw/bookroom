import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import RoleController from "@/controller/RoleController";
import routeMap from "@/routers/RouteMap";
const routerList = [
    {
        path: routeMap.ADMIN_ROLE_ACTIVED,
        method: "GET",
        handler: RoleController.queryActivedRoleList,
        auth: [USER_ROLE_ENUM.OPS]
    },
    {
        path: routeMap.ADMIN_ROLE,
        method: "GET",
        handler: RoleController.queryRoleList,
        auth: [USER_ROLE_ENUM.ADMIN]
    },
    {
        path: routeMap.ADMIN_ROLE_DETAIL,
        method: "GET",
        handler: RoleController.getRoleDetail,
        auth: [USER_ROLE_ENUM.ADMIN]
    },
    {
        path: routeMap.ADMIN_ROLE,
        method: "POST",
        handler: RoleController.addRole,
        auth: [USER_ROLE_ENUM.ADMIN]
    },
    {
        path: routeMap.ADMIN_ROLE_STATUS,
        method: "PUT",
        handler: RoleController.changeRoleStatus,
        auth: [USER_ROLE_ENUM.ADMIN]
    },
    {
        path: routeMap.ADMIN_ROLE_DETAIL,
        method: "PUT",
        handler: RoleController.changeRoleInfo,
        auth: [USER_ROLE_ENUM.ADMIN]
    },
    {
        path: routeMap.ADMIN_ROLE_DETAIL,
        method: "DELETE",
        handler: RoleController.deleteRole,
        auth: [USER_ROLE_ENUM.ADMIN]
    },
];

export default routerList;