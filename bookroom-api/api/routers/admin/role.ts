import RoleController from "@/controller/RoleController";
import routeMap from "@/constants/RouteMap";
const routerList = [
    {
        path: routeMap.ADMIN_ROLE_ACTIVED,
        method: "GET",
        handler: RoleController.queryActivedRoleList,
    },
    {
        path: routeMap.ADMIN_ROLE,
        method: "GET",
        handler: RoleController.queryRoleList,
    },
    {
        path: routeMap.ADMIN_ROLE_DETAIL,
        method: "GET",
        handler: RoleController.getRoleDetail,
    },
    {
        path: routeMap.ADMIN_ROLE,
        method: "POST",
        handler: RoleController.addRole,
    },
    {
        path: routeMap.ADMIN_ROLE_STATUS,
        method: "PUT",
        handler: RoleController.changeRoleStatus,
    },
    {
        path: routeMap.ADMIN_ROLE_DETAIL,
        method: "PUT",
        handler: RoleController.changeRoleInfo,
    },
    {
        path: routeMap.ADMIN_ROLE_DETAIL,
        method: "DELETE",
        handler: RoleController.deleteRole,
    },
];

export default routerList;