import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { ROLE_RULE } from "@/common/rule";
import { StatusModelRule } from "./rule";

// 用户表
class RoleModel extends Model {
  // 校验数据唯一性
  static judgeUnique = async (data: any, id: any = null) => {
    if (!data) {
      return false;
    }
    const orWhereArray: { [x: string]: any; }[] = [];
    const fieldKeys = ["name", "code"];
    // 筛选唯一项
    Object.keys(data).forEach((key) => {
      if (data[key] && fieldKeys.includes(key)) {
        orWhereArray.push({
          [key]: data[key],
        });
      }
    });
    const where: any = {
      [Op.or]: orWhereArray,
    };
    // 如果有id参数，则为数据更新操作
    if (id) {
      where.id = { [Op.not]: id };
    }
    const count = await super.count({
      where,
    });

    return !count;
  };
}
// 初始化model
RoleModel.init(
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
    // 角色名称
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: "name",
      validate: {
        is: {
          args: ROLE_RULE.name.RegExp,
          msg: ROLE_RULE.name.message,
        },
        notEmpty: {
          msg: "请填入角色名称",
        },
      },
    },
    // 角色标识
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: "code",
      validate: {
        is: {
          args: ROLE_RULE.code.RegExp,
          msg: ROLE_RULE.code.message,
        },
        notEmpty: {
          msg: "请填入角色标识",
        },
      },
    },
    // 启用状态：1为启用，-1为禁用
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
    tableName: "role",
    // 索引
    indexes: [
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["name"]
      },
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["code"]
      }
    ],
    timestamps: true,
    sequelize: database,
  }
);

// 同步模型到数据库
// RoleModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
// RoleModel.hasMany(UserRoleModel, {
//   foreignKey: "roleId",
//   sourceKey: "id",
//   as: "roleUserRelation",
// });
export default RoleModel;
