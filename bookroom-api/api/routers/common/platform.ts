import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import PlatformController from "@/controller/PlatformController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.PLATFORM,
        method: "GET",
        handler: PlatformController.queryPlatformList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.PLATFORM_ACTIVED,
        method: "GET",
        handler: PlatformController.queryActivedPlatformList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.PLATFORM_DETAIL,
        method: "GET",
        handler: PlatformController.getPlatformInfo,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.PLATFORM,
        method: "POST",
        handler: PlatformController.addPlatform,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.PLATFORM_DETAIL,
        method: "PUT",
        handler: PlatformController.changePlatformInfo,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.PLATFORM_PARAMETERS,
        method: "PUT",
        handler: PlatformController.changePlatformParameters,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.PLATFORM_STATUS,
        method: "PUT",
        handler: PlatformController.changePlatformStatus,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.PLATFORM_DETAIL,
        method: "DELETE",
        handler: PlatformController.deletePlatform,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
];
export default routerList;