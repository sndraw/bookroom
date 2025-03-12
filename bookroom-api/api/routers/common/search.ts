
import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import SearchController from "../../controller/SearchController";

import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.SEARCH,
        method: "GET",
        handler: SearchController.index,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.SEARCH,
        method: "POST",
        handler: SearchController.index,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV]
    },
];

export default routerList;
