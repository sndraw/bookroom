import AILmThirdController from "@/controller/AILmThirdController";
import routeMap from "@/constants/RouteMap";

const routerList = [
    {
        path: routeMap.AI_LM_ALL,
        method: "GET",
        handler: AILmThirdController.queryAllAILmList,
    },
    {
        path: routeMap.AI_LM,
        method: "GET",
        handler: AILmThirdController.queryAILmList,
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "GET",
        handler: AILmThirdController.getAILmInfo,
    },
    {
        path: routeMap.AI_LM_PULL,
        method: "POST",
        handler: AILmThirdController.pullAILm,
    },
    {
        path: routeMap.AI_LM_RUN,
        method: "PUT",
        handler: AILmThirdController.runAILm,
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "DELETE",
        handler: AILmThirdController.deleteAILm,
    },
    {
        path: routeMap.AI_LM_CHAT,
        method: "POST",
        handler: AILmThirdController.chatAILm,
    },
    {
        path: routeMap.AI_LM_GENERATE,
        method: "POST",
        handler: AILmThirdController.generateAILm,
    },
    {
        path: routeMap.AI_LM_IMAGE,
        method: "POST",
        handler: AILmThirdController.generateImage,
    },
    {
        path: routeMap.AI_LM_EMBED,
        method: "POST",
        handler: AILmThirdController.embeddingVector,
    },
];

export default routerList;
