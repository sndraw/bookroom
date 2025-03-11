import { DataTypes, Model, Op } from "sequelize";
import database from "../common/database";
import UserModel from "./UserModel";
import RoleModel from "./RoleModel";
import { StatusEnum } from "@/constants/DataMap";
import { StatusModelRule } from "./rule";

// 用户表
class UserRoleModel extends Model {

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
    if (data?.user_id && data?.role_id) {
      where.user_id = data?.user_id;
      where.role_id = data?.role_id;
      const count = await super.count({
        where,
      });
      if (count) {
        throw new Error("用户角色已添加");
      }
    }
    return true;
  };

}


// 初始化model
UserRoleModel.init(
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
    // 用户ID
    userId: {
      field: "user_id",
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
        notEmpty: {
          msg: "请填入用户ID",
        },
      },
    },
    // 角色ID
    roleId: {
      field: "role_id",
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
        notEmpty: {
          msg: "请填入角色ID",
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
    tableName: "user_role",
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
        fields: ["user_id"]
      }
    ],
    timestamps: true,
    sequelize: database,
  }
);

// 同步模型到数据库
// UserRoleModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
// UserRoleModel.belongsTo(UserModel, {
//   foreignKey: "id",
//   targetKey: "userId"
// });
// UserRoleModel.belongsTo(RoleModel, {
//   foreignKey: "id",
//   targetKey: "roleId"
// });

export default UserRoleModel;
