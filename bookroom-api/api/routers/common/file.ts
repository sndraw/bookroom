import FileController from "@/controller/FileController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.FILE_UPLOAD_URL,
        method: "GET",
        handler: FileController.getUploadUrl,
    },
    {
        path: routeMap.FILE_UPLOAD,
        method: "POST",
        handler: FileController.upload,
    },
    {
        path: routeMap.FILE_PREVIEW,
        method: "GET",
        handler: FileController.preview,
    },
    {
        path: routeMap.FILE_DOWNLOAD,
        method: "GET",
        handler: FileController.download,
    },
];

export default routerList;