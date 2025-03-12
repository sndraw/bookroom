import AIChatController from "@/controller/AIChatController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.AI_CHAT,
        method: "GET",
        handler: AIChatController.queryAIChatList,
    },
    {
        path: routeMap.AI_CHAT_DETAIL,
        method: "GET",
        handler: AIChatController.getAIChatInfo,
    },
    {
        path: routeMap.AI_CHAT,
        method: "POST",
        handler: AIChatController.saveAIChat,
    },
    {
        path: routeMap.AI_CHAT_DETAIL,
        method: "PUT",
        handler: AIChatController.saveAIChat,
    },
    {
        path: routeMap.AI_CHAT_DETAIL,
        method: "DELETE",
        handler: AIChatController.deleteAIChat,
    },
];

export default routerList;
