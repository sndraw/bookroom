import LoginController from "../../controller/LoginController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.LOGIN,
        method: "POST",
        handler: LoginController.login,
        auth: null
    },
    {
        path: routeMap.REGISTER,
        method: "POST",
        handler: LoginController.register,
        auth: null
    },
    {
        path: routeMap.REFRESH_TOKEN,
        method: "POST",
        handler: LoginController.reqRefreshToken,
        auth: null
    },
];

export default routerList;
