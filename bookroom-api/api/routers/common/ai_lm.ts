import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import AILmController from "@/controller/AILmController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.AI_LM,
        method: "GET",
        handler: AILmController.queryAILmList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "GET",
        handler: AILmController.getAILmInfo,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM,
        method: "POST",
        handler: AILmController.addAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "PUT",
        handler: AILmController.updateAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_LM_PULL,
        method: "POST",
        handler: AILmController.pullAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_LM_RUN,
        method: "PUT",
        handler: AILmController.runAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_LM_DETAIL,
        method: "DELETE",
        handler: AILmController.deleteAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_LM_CHAT,
        method: "POST",
        handler: AILmController.chatAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM_GENERATE,
        method: "POST",
        handler: AILmController.generateAILm,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM_IMAGE,
        method: "POST",
        handler: AILmController.generateImage,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_LM_EMBED,
        method: "POST",
        handler: AILmController.embeddingVector,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    }
];

export default routerList;
