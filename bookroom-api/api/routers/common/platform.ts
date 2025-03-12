import PlatformController from "@/controller/PlatformController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.PLATFORM_ACTIVED,
        method: "GET",
        handler: PlatformController.queryActivedPlatformList,
    },
    {
        path: routeMap.PLATFORM,
        method: "GET",
        handler: PlatformController.queryPlatformList,
    },
    {
        path: routeMap.PLATFORM_DETAIL,
        method: "GET",
        handler: PlatformController.getPlatformInfo,
    },
    {
        path: routeMap.PLATFORM,
        method: "POST",
        handler: PlatformController.addPlatform,
    },
    {
        path: routeMap.PLATFORM_DETAIL,
        method: "PUT",
        handler: PlatformController.changePlatformInfo,
    },
    {
        path: routeMap.PLATFORM_STATUS,
        method: "PUT",
        handler: PlatformController.changePlatformStatus,
    },
    {
        path: routeMap.PLATFORM_DETAIL,
        method: "DELETE",
        handler: PlatformController.deletePlatform,
    },
];
export default routerList;