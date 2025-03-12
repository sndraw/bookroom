
import TestController from "../../controller/TestController";

import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.TEST,
        method: "GET",
        handler: TestController.index,
        auth: null
    },
    {
        path: routeMap.TEST,
        method: "POST",
        handler: TestController.index,
        auth: null
    },
];

export default routerList;
