import AILmController from "@/controller/AILmController";
import routeMap from "@/constants/RouteMap";

const routerList = [
    {
        path: routeMap.AI_LM_ALL,
        method: "GET",
        handler: AILmController.queryAllAILmList,
    },
    {
        path: routeMap.AI_LM,
        method: "GET",
        handler: AILmController.queryAILmList,
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "GET",
        handler: AILmController.getAILmInfo,
    },
    {
        path: routeMap.AI_LM,
        method: "POST",
        handler: AILmController.addAILm,
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "PUT",
        handler: AILmController.changeAILmInfo,
    },
    {
        path: routeMap.AI_LM_STATUS,
        method: "PUT",
        handler: AILmController.changeAILmStatus,
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "DELETE",
        handler: AILmController.deleteAILm,
    },
];

export default routerList;
