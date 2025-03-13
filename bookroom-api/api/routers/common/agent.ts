import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import AgentController from "@/controller/AgentController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.AGENT_ALL,
        method: "GET",
        handler: AgentController.queryAllAgentList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
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
    {
        path: routeMap.AGENT,
        method: "POST",
        handler: AgentController.addAgent,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AGENT_DETAIL,
        method: "PUT",
        handler: AgentController.changeAgentInfo,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AGENT_STATUS,
        method: "PUT",
        handler: AgentController.changeAgentStatus,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AGENT_DETAIL,
        method: "DELETE",
        handler: AgentController.deleteAgent,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.AGENT_CHAT,
        method: "POST",
        handler: AgentController.agentChat,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    }
];

export default routerList;
