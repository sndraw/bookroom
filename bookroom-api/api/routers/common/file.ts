import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import FileController from "@/controller/FileController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.FILE,
        method: "GET",
        handler: FileController.queryFileList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.FILE_UPLOAD_URL,
        method: "GET",
        handler: FileController.getUploadUrl,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.FILE_UPLOAD,
        method: "POST",
        handler: FileController.upload,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.FILE_PREVIEW,
        method: "GET",
        handler: FileController.preview,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.FILE_DOWNLOAD,
        method: "GET",
        handler: FileController.download,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.FILE_DETAIL,
        method: "DELETE",
        handler: FileController.deleteFile,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },

];

export default routerList;