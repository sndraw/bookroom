import LoginController from "../../controller/LoginController";
import routeMap from "@/constants/RouteMap";

const routerList = [
    {
        path: routeMap.LOGIN,
        method: "POST",
        handler: LoginController.login,
    },
    {
        path: routeMap.REGISTER,
        method: "POST",
        handler: LoginController.register,
    },
    {
        path: routeMap.REFRESH_TOKEN,
        method: "POST",
        handler: LoginController.reqRefreshToken,
    },
];

export default routerList;
