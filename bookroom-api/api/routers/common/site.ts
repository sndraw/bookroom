import SiteController from "../../controller/SiteController";
import routeMap from "@/routers/RouteMap";
const routerList = [
    {
        path: routeMap.SETUP,
        method: "POST",
        handler: SiteController.setup,
    },
];

export default routerList;