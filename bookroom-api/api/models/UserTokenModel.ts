import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";

// 用户-鉴权表
class UserTokenModel extends Model {
  // 校验数据唯一性
  static judgeUnique = async (data: any, id: any = null) => {
    if (!data) {
      return false;
    }
    const orWhereArray: { [x: string]: any; }[] = [];
    const fieldKeys = ["token"];
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
    if (count) {
      throw new Error("token已存在");
    }
    return true;
  };
}
// 初始化model
UserTokenModel.init(
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
      type: DataTypes.STRING(64),
      allowNull: false,
      field: "user_id",
      validate: {
        isUUID: 4,
        notEmpty: {
          msg: "请填入用户名",
        },
      },
    },
    // 鉴权码
    token: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      field: "token",
      validate: {
        len: [1, 1024],
        notEmpty: {
          msg: "请填入鉴权码",
        },
      },
    },
    // 过期时间（秒）0：不设置过期时间
    expiresIn: {
      type: DataTypes.BIGINT({
        length: 18
      }).UNSIGNED,
      allowNull: true,
      field: "expires_in",
      defaultValue: 0,
      validate: {
        isNumeric: true,
        len: [1, 18],
      },
    },
    // 状态：1为启用，-1为过期
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
          msg: "请填入状态",
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
    tableName: "user_token",
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
        fields: ["token"],
      },
    ],
    timestamps: true,
    sequelize: database,
  }
);

// 同步模型到数据库
// UserTokenModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default UserTokenModel;
