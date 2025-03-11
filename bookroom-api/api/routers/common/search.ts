
import SearchController from "../../controller/SearchController";

import routeMap from "@/constants/RouteMap";

const routerList = [
    {
        path: routeMap.SEARCH,
        method: "GET",
        handler: SearchController.index,
    },
    {
        path: routeMap.SEARCH,
        method: "POST",
        handler: SearchController.index,
    },
];

export default routerList;
