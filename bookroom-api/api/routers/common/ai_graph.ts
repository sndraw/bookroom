import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import AIGraphController from "@/controller/AIGraphController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.AI_GRAPH,
        method: "GET",
        handler: AIGraphController.queryGraphList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_DETAIL,
        method: "GET",
        handler: AIGraphController.getGraphInfo,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_WORKSPACE,
        method: "GET",
        handler: AIGraphController.queryGraphWorkspaceList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_WORKSPACE,
        method: "POST",
        handler: AIGraphController.createGraphWorkspace,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_WORKSPACE_DETAIL,
        method: "PUT",
        handler: AIGraphController.updateGraphWorkspace,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_WORKSPACE_DETAIL,
        method: "DELETE",
        handler: AIGraphController.deleteGraphWorkspace,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_NODE_DETAIL,
        method: "GET",
        handler: AIGraphController.getGraphNode,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_NODE,
        method: "POST",
        handler: AIGraphController.createGraphNode,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_NODE_DETAIL,
        method: "PUT",
        handler: AIGraphController.updateGraphNode,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_NODE_DETAIL,
        method: "DELETE",
        handler: AIGraphController.deleteGraphNode,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_LINK_DETAIL,
        method: "GET",
        handler: AIGraphController.getGraphLink,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_LINK,
        method: "POST",
        handler: AIGraphController.createGraphLink,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_LINK_DETAIL,
        method: "PUT",
        handler: AIGraphController.updateGraphLink,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_LINK_DETAIL,
        method: "DELETE",
        handler: AIGraphController.deleteGraphLink,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_DATA,
        method: "GET",
        handler: AIGraphController.queryGraphData,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_DATA_TEXT,
        method: "POST",
        handler: AIGraphController.insertText,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_DATA_FILE,
        method: "POST",
        handler: AIGraphController.insertFile,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_CHAT,
        method: "POST",
        handler: AIGraphController.graphChat,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_DATA,
        method: "DELETE",
        handler: AIGraphController.clearGraphData,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
    {
        path: routeMap.AI_GRAPH_DOCUMENT,
        method: "GET",
        handler: AIGraphController.queryGraphDocumentList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_DOCUMENT_DETAIL,
        method: "GET",
        handler: AIGraphController.getGraphDocument,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AI_GRAPH_DOCUMENT_DETAIL,
        method: "DELETE",
        handler: AIGraphController.deleteGraphDocument,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
];

export default routerList;
