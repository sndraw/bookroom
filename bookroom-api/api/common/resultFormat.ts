import ErrorCode from "@/constants/ErrorCode";
/**
 * 返回封装后的API数据到客户端
 * @access protected
 * @param  Int $code 返回的接口状态，1:成功，其他:失败
 * @param  String $message 提示信息
 * @param  Any $data 要返回的数据
 * @return Object
 */
export const result = ({
    data = null,
    code = ErrorCode.SUCCESS.code,
    message = ErrorCode.SUCCESS.message
}: any = {}) => {
    const result = {
        code: code,
        message: message,
        data: data,
    };
    return result;
};

// 结果返回-请求成功
export const resultSuccess = ({
    data = null, message = ErrorCode.SUCCESS.message,
}: any = {}) => {
    const result = {
        code: ErrorCode.SUCCESS.code,
        message: message,
        data: data,
    };
    return result;
};

// 结果返回-请求失败
export const resultError = ({
    code = null,
    data = null,
    message = ErrorCode.ERROR.message,
}: any = {}) => {
    const result = {
        code: code || ErrorCode.ERROR.code,
        message: message,
        data: data
    };
    return result;
};

// 结果返回-接口不存在
export const resultNotFound = ({
    data = null, message = ErrorCode.NOT_FOUND.message
}: any = {}) => {
    const result = {
        code: ErrorCode.NOT_FOUND.code,
        message: message,
        data: data,
    };
    return result;
};

// 结果返回-权限不足
export const resultDenied = ({
    data = null, message = ErrorCode.DENIED.message
}: any = {}) => {
    const result = {
        code: ErrorCode.DENIED.code,
        message: message,
        data: data,
    };
    return result;
};

// 结果返回-操作非法
export const resultIllegal = ({
    data = null, message = ErrorCode.ILLEGAL.message
}: any = {}) => {
    const result = {
        code: ErrorCode.ILLEGAL.code,
        message: message,
        data: data,
    };
    return result;
};

// 结果返回-尚未登录
export const resultNotLogin = ({
    data = null, message = ErrorCode.NOT_LOGIN.message
}: any = {}) => {
    const result = {
        code: ErrorCode.NOT_LOGIN.code,
        message: message,
        data: data,
    };
    return result;
};

// 结果返回-账户被禁
export const resultLimitLogin = ({
    data = null, message = ErrorCode.LIMIT_LOGIN.message
} = {}) => {
    const result = {
        code: ErrorCode.LIMIT_LOGIN.code,
        message: message,
        data: data,
    };
    return result;
};

// 结果返回-参数为空
export const resultParamsRequired = ({
    data = null, message = ErrorCode.PARAMS_REQUIRED.message
}: any = {}) => {
    const result = {
        code: ErrorCode.PARAMS_REQUIRED.code,
        message: message,
        data: data,
    };
    return result;
};

// 结果返回-参数非法
export const resultParamsIllegal = ({
    data = null,
    message = ErrorCode.PARAMS_ILLEGAL.message,
    errors = null
}: any = {}) => {
    const result: any = {
        code: ErrorCode.PARAMS_ILLEGAL.code,
        message: message,
        data: data,
    };
    if (errors) {
        result.errors = errors;
    }
    return result;
};

// 结果返回-未初始化
export const resultNotSetup = ({
    data = null, message = ErrorCode.NOT_SETUP.message
}: any = {}) => {
    const result = {
        code: ErrorCode.NOT_SETUP.code,
        message: message,
        data: data,
    };
    return result;
};