import SiteController from "../../controller/SiteController";
import routeMap from "@/routers/RouteMap";
const routerList = [
    {
        path: routeMap.HOME,
        method: "GET",
        handler: SiteController.home,
        auth: null
    },
    {
        path: routeMap.SETUP,
        method: "POST",
        handler: SiteController.setup,
        auth: null
    },
];

export default routerList;