import SiteController from "../../controller/SiteController";
import routeMap from "@/constants/RouteMap";
const routerList = [
    {
        path: routeMap.SETUP,
        method: "POST",
        handler: SiteController.setup,
    },
];

export default routerList;