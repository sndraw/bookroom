import { USER_ROLE_ENUM } from './constants/RoleMap';

// 全局-权限集
export const globalAccessMap = {
  canSeeAdmin: [USER_ROLE_ENUM.ADMIN],
  canSeeOps: [USER_ROLE_ENUM.ADMIN, USER_ROLE_ENUM.OPS],
  canSeeDev: [USER_ROLE_ENUM.ADMIN, USER_ROLE_ENUM.OPS, USER_ROLE_ENUM.DEV],
  canSeeUser: [
    USER_ROLE_ENUM.ADMIN,
    USER_ROLE_ENUM.OPS,
    USER_ROLE_ENUM.DEV,
    USER_ROLE_ENUM.USER,
  ],
};

export default (initialState: API.UserInfo) => {
  const { role = USER_ROLE_ENUM.USER } = initialState || {};
  // 当前角色-权限集
  const currentRoleAccessMap = {
    canSeeAdmin: globalAccessMap?.canSeeAdmin?.includes(role as USER_ROLE_ENUM),
    canSeeOps: globalAccessMap?.canSeeOps?.includes(role as USER_ROLE_ENUM),
    canSeeDev: globalAccessMap?.canSeeDev?.includes(role as USER_ROLE_ENUM),
    canSeeUser: globalAccessMap?.canSeeUser?.includes(role as USER_ROLE_ENUM),
  };
  return currentRoleAccessMap;
};
