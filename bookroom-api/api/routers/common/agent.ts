import AgentController from "@/controller/AgentController";
import routeMap from "@/constants/RouteMap";

const routerList = [
    {
        path: routeMap.AGENT,
        method: "GET",
        handler: AgentController.queryAgentList,
    },
    {
        path: routeMap.AGENT_DETAIL,
        method: "GET",
        handler: AgentController.getAgentInfo,
    },
];

export default routerList;
