import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import VoiceController from "@/controller/VoiceController";
import routeMap from "@/routers/RouteMap";

const routerList = [
    {
        path: routeMap.VOICE_RECOGNIZE,
        method: "GET",
        handler: VoiceController.queryVoiceRecognizeList,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.VOICE_RECOGNIZE_DETAIL,
        method: "GET",
        handler: VoiceController.getVoiceRecognizeInfo,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    },
    {
        path: routeMap.VOICE_RECOGNIZE_TASK,
        method: "POST",
        handler: VoiceController.voiceRecognizeTask,
        auth: [USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV, USER_ROLE_ENUM.USER]
    }
]
export default routerList;