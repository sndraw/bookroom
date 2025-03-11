import AIGraphMultiController from "@/controller/AIGraphMultiController";
import routeMap from "@/constants/RouteMap";

const routerList = [
    {
        path: routeMap.AI_GRAPH_MULTI,
        method: "GET",
        handler: AIGraphMultiController.queryGraphList,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_DETAIL,
        method: "GET",
        handler: AIGraphMultiController.getGraphInfo,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_WORKSPACE,
        method: "GET",
        handler: AIGraphMultiController.queryGraphWorkspaceList,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_WORKSPACE,
        method: "POST",
        handler: AIGraphMultiController.createGraphWorkspace,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_WORKSPACE_DETAIL,
        method: "PUT",
        handler: AIGraphMultiController.updateGraphWorkspace,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_WORKSPACE_DETAIL,
        method: "DELETE",
        handler: AIGraphMultiController.deleteGraphWorkspace,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_NODE_DETAIL,
        method: "GET",
        handler: AIGraphMultiController.getGraphNode,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_NODE,
        method: "POST",
        handler: AIGraphMultiController.createGraphNode,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_NODE_DETAIL,
        method: "PUT",
        handler: AIGraphMultiController.updateGraphNode,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_NODE_DETAIL,
        method: "DELETE",
        handler: AIGraphMultiController.deleteGraphNode,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_LINK_DETAIL,
        method: "GET",
        handler: AIGraphMultiController.getGraphLink,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_LINK,
        method: "POST",
        handler: AIGraphMultiController.createGraphLink,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_LINK_DETAIL,
        method: "PUT",
        handler: AIGraphMultiController.updateGraphLink,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_LINK_DETAIL,
        method: "DELETE",
        handler: AIGraphMultiController.deleteGraphLink,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_DATA,
        method: "GET",
        handler: AIGraphMultiController.queryGraphData,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_DATA_TEXT,
        method: "POST",
        handler: AIGraphMultiController.insertText,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_DATA_FILE,
        method: "POST",
        handler: AIGraphMultiController.insertFile,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_CHAT,
        method: "POST",
        handler: AIGraphMultiController.graphChat,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_DATA,
        method: "DELETE",
        handler: AIGraphMultiController.clearGraphData,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_DOCUMENT,
        method: "GET",
        handler: AIGraphMultiController.queryGraphDocumentList,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_DOCUMENT_DETAIL,
        method: "GET",
        handler: AIGraphMultiController.getGraphDocument,
    },
    {
        path: routeMap.AI_GRAPH_MULTI_DOCUMENT_DETAIL,
        method: "DELETE",
        handler: AIGraphMultiController.deleteGraphDocument,
    },
];

export default routerList;
