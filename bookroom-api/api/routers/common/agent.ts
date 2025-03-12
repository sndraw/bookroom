import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import AgentController from "@/controller/AgentController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.AGENT,
        method: "GET",
        handler: AgentController.queryAgentList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AGENT_DETAIL,
        method: "GET",
        handler: AgentController.getAgentInfo,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
];

export default routerList;
