export default {
    SUCCESS: {
        code: 0,
        message: "请求成功",
    },
    ERROR: {
        code: -1,
        message: "服务器错误",
    },
    NOT_SETUP: {
        code: 401001,
        message: "请先初始化系统",
    },
    NOT_LOGIN: {
        code: 401002,
        message: "请先登录",
    },
    NOT_PERMISSION: {
        code: 401003,
        message: "没有权限",
    },
    DENIED: {
        code: 401004,
        message: "权限不足",
    },
    ILLEGAL: {
        code: 401005,
        message: "操作非法",
    },
    NOT_AUTH: {
        code: 401006,
        message: "未授权",
    },
    LIMIT_LOGIN: {
        code: 401007,
        message: "限制登录",
    },
    NOT_FOUND: {
        code: 404001,
        message: "找不到页面",
    },
    PARAMS_ILLEGAL: {
        code: 400001,
        message: "参数不合法",
    },
    PARAMS_REQUIRED: {
        code: 400002,
        message: "参数缺失",
    }
};
