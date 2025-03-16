import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import AILmThirdController from "@/controller/AILmThirdController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.AI_LM_ALL,
        method: "GET",
        handler: AILmThirdController.queryAllAILmList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM,
        method: "GET",
        handler: AILmThirdController.queryAILmList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "GET",
        handler: AILmThirdController.getAILmInfo,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM_PULL,
        method: "POST",
        handler: AILmThirdController.pullAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_LM_RUN,
        method: "PUT",
        handler: AILmThirdController.runAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "DELETE",
        handler: AILmThirdController.deleteAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_LM_CHAT,
        method: "POST",
        handler: AILmThirdController.chatAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM_GENERATE,
        method: "POST",
        handler: AILmThirdController.generateAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM_IMAGE,
        method: "POST",
        handler: AILmThirdController.generateImage,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM_EMBED,
        method: "POST",
        handler: AILmThirdController.embeddingVector,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    }
];

export default routerList;
