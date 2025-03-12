import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import AIChatController from "@/controller/AIChatController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.AI_CHAT,
        method: "GET",
        handler: AIChatController.queryAIChatList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_CHAT_DETAIL,
        method: "GET",
        handler: AIChatController.getAIChatInfo,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_CHAT,
        method: "POST",
        handler: AIChatController.saveAIChat,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]

    },
    {
        path: routeMap.AI_CHAT_DETAIL,
        method: "PUT",
        handler: AIChatController.saveAIChat,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_CHAT_DETAIL,
        method: "DELETE",
        handler: AIChatController.deleteAIChat,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
];

export default routerList;
