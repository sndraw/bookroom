import AIPlatformController from "@/controller/AIPlatformController";
import routeMap from "@/constants/RouteMap";

const routerList = [
    {
        path: routeMap.AI_PLATFORM_ACTIVED,
        method: "GET",
        handler: AIPlatformController.queryActivedAIPlatformList,
    },
    {
        path: routeMap.AI_PLATFORM,
        method: "GET",
        handler: AIPlatformController.queryAIPlatformList,
    },
    {
        path: routeMap.AI_PLATFORM_DETAIL,
        method: "GET",
        handler: AIPlatformController.getAIPlatformInfo,
    },
    {
        path: routeMap.AI_PLATFORM,
        method: "POST",
        handler: AIPlatformController.addAIPlatform,
    },
    {
        path: routeMap.AI_PLATFORM_DETAIL,
        method: "PUT",
        handler: AIPlatformController.changeAIPlatformInfo,
    },
    {
        path: routeMap.AI_PLATFORM_STATUS,
        method: "PUT",
        handler: AIPlatformController.changeAIPlatformStatus,
    },
    {
        path: routeMap.AI_PLATFORM_DETAIL,
        method: "DELETE",
        handler: AIPlatformController.deleteAIPlatform,
    },
];
export default routerList;