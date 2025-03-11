import { DataTypes, Model, Op } from "sequelize";
import database from "../common/database";
import { encrypt } from "../common/crypto";
import UserRoleModel from "./UserRoleModel";
import RoleModel from "./RoleModel";
import { USER_RULE } from "../common/rule";
import { StatusEnum } from "@/constants/DataMap";
import { StatusModelRule } from "./rule";

// 用户表
class UserModel extends Model {
  // 校验数据唯一性
  static judgeUnique = async (data: any, id: any = null) => {
    if (!data) {
      throw new Error("请传入数据");
    }
    const where: any = {};
    // 如果有id参数，则为数据更新操作
    if (id) {
      where.id = { [Op.not]: id };
    }

    if (data?.username) {
      const newWhere = {
        ...where,
        username: data?.username
      }
      const count = await super.count({
        where: newWhere,
      });
      if (count) {
        throw new Error("用户名已存在");
      }
    }
    if (data?.email) {
      const newWhere = {
        ...where,
        email: data?.email
      }
      const count = await super.count({
        where: newWhere,
      });
      if (count) {
        throw new Error("邮箱已存在");
      }
    }
    return true;
  };

  // 加密密码
  static encryptPassword = async (password: any, salt = null) => {
    return encrypt(password, salt);
  };
}
// 初始化model
UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: 4,
        notEmpty: {
          msg: "请填入ID",
        },
      },
    },
    // 用户名
    username: {
      field: "username",
      type: DataTypes.STRING(64),
      allowNull: false,
      validate: {
        is: {
          args: USER_RULE.username.RegExp,
          msg: USER_RULE.username.message,
        },
        notEmpty: {
          msg: "请填入用户名",
        },
      },
    },
    // 邮箱
    email: {
      field: "email",
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        len: [4, 255],
        notEmpty: {
          msg: "请填入邮箱",
        },
      },
    },
    // 密码
    password: {
      field: "password",
      type: DataTypes.STRING(64),
      allowNull: false,
      validate: {
        len: [4, 64],
        notEmpty: {
          msg: "请填入密码",
        },
      },
    },
    // 加密盐值-用于密码加密
    salt: {
      field: "salt",
      type: DataTypes.STRING(64),
      allowNull: true,
      validate: {
        len: [4, 64],
      },
    },

    status: {
      field: "status",
      type: DataTypes.INTEGER({
        length: 2
      }),
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: StatusModelRule.isIn,
        notEmpty: {
          msg: "请填入启用状态",
        },
      },
    },
    // 创建时间
    createdAt: {
      field: "created_time",
      type: DataTypes.DATE,
      allowNull: false
    },
    // 更新时间
    updatedAt: {
      field: "updated_time",
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "user",
    // 索引
    indexes: [
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["id"],
      },
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["username"]
      },
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["email"]
      },
    ],
    timestamps: true,
    sequelize: database,
    hooks: {
      afterFind: (users: any, options) => {
        if (Array.isArray(users)) {
          users.forEach(user => {
            if (user?.RoleModels) {
              user.dataValues.role = user.RoleModels.map((role: { toJSON: () => any; }) => role.toJSON()?.code)?.join(",");
              user.dataValues.roleId = user.RoleModels.map((role: { toJSON: () => any; }) => role.toJSON()?.id)?.join(",");
              user.dataValues.roleName = user.RoleModels.map((role: { toJSON: () => any; }) => role.toJSON()?.name)?.join(",");
              delete user.RoleModels;
            }
          });

        } else if (users && users.RoleModels) {
          users.role = users.RoleModels.map((role: { toJSON: () => any; }) => role.toJSON()?.code)?.join(",");
          users.roleId = users.RoleModels.map((role: { toJSON: () => any; }) => role.toJSON()?.id)?.join(",");
          users.roleName = users.RoleModels.map((role: { toJSON: () => any; }) => role.toJSON()?.name)?.join(",");
          delete users.RoleModels;
        }
      }
    }
  }
);

// 同步模型到数据库
// UserModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
// UserModel.hasMany(UserRoleModel, {
//   foreignKey: "userId",
//   sourceKey: "id",
//   as: "userRoleRelation",
// });
// 用户与角色多对多关系
UserModel.belongsToMany(RoleModel, { through: UserRoleModel, foreignKey: "userId", otherKey: "roleId" });
RoleModel.belongsToMany(UserModel, { through: UserRoleModel, foreignKey: "roleId", otherKey: "userId" });
export default UserModel;
