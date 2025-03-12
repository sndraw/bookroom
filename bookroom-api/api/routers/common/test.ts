
import TestController from "../../controller/TestController";

import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.TEST,
        method: "GET",
        handler: TestController.index,
    },
    {
        path: routeMap.TEST,
        method: "POST",
        handler: TestController.index,
    },
];

export default routerList;
