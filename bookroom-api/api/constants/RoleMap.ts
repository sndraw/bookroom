// 用户-角色-枚举值
export enum USER_ROLE_ENUM {
    USER = 'normal',
    DEV = 'developer',
    OPS = 'operator',
    ADMIN = 'admin',
}

// 用户-角色-名称对象
export const USER_ROLE_NAME_OBJECT: { [key: string]: string } = {
    USER: '普通用户',
    DEV: '开发人员',
    OPS: '运维人员',
    ADMIN: '管理员',
}

// 用户-角色-对象
export const getRoleMap = () => {
    const result: Array<any> = [];
    Object.entries(USER_ROLE_ENUM).forEach(([key, value]) => {
        result.push({
            key,
            value,
            name: USER_ROLE_NAME_OBJECT[key]
        });
    });
    return result
}