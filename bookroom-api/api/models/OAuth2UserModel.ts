import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";

// OAuth2-用户表
class OAuth2UserModel extends Model {
  // 校验数据唯一性
  static judgeUnique = async (data: any, id: any = null) => {
    if (!data) {
      return false;
    }
    const orWhereArray: { [x: string]: any; }[] = [];
    const fieldKeys = ["openid"];
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
OAuth2UserModel.init(
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
    // 客户系统注册ID
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      validate: {
        isUUID: 4,
        notEmpty: {
          msg: "请填入用户ID",
        },
      },
    },
    // 用户唯一对外标识
    openid: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: "openid",
      validate: {
        is: ["^[a-z0-9]+$", "i"],
        len: [1, 64],
        notEmpty: {
          msg: "请填入openid",
        },
      },
    },
    // 客户系统注册ID
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "client_id",
      validate: {
        isUUID: 4,
        notEmpty: {
          msg: "请填入客户系统注册ID",
        },
      },
    },
    // 授权状态：1为允许授权，-1为禁止授权
    status: {
      type: DataTypes.INTEGER({
        length: 2
      }),
      allowNull: false,
      field: "status",
      defaultValue: 1,
      validate: {
        isIn: StatusModelRule.isIn,
        notEmpty: {
          msg: "请填入授权状态",
        },
      },
    },
    // 创建时间
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_time"
    },
    // 更新时间
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "updated_time"
    },
  },
  {
    tableName: "oauth2_user",
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
        fields: ["openid"],
      },
    ],
    timestamps: true,
    sequelize: database,
  }
);

// 同步模型到数据库
// OAuth2UserModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default OAuth2UserModel;
