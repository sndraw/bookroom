import { DataTypes, Model, Op } from "sequelize";
import database from "../common/database";
import { StatusEnum } from "@/constants/DataMap";
import { StatusModelRule } from "./rule";

// 微信公众号/小程序-主表
class WechatModel extends Model {
  // 校验数据唯一性
  static judgeUnique = async (data: any, id: any = null) => {
    if (!data) {
      return false;
    }
    const orWhereArray: { [x: string]: any; }[] = [];
    const fieldKeys = ["hash", "title", "appid", "originid"];
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
WechatModel.init(
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
    // 唯一hash标识
    hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "hash",
      validate: {
        is: ["^[a-z0-9]+$", "i"],
        len: [1, 255],
        notEmpty: {
          msg: "请填入hash标识",
        },
      },
    },
    // 微信公众号/小程序名称
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "name",
      validate: {
        len: [1, 255],
        notEmpty: {
          msg: "请填入公众号/小程序名称",
        },
      },
    },
    // 操作用户ID
    userId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "user_id",
      validate: {
        is: ["^[a-z0-9]+$", "i"],
        len: [0, 64],
      },
    },
    // 第三方开发验证token
    token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "token",
      validate: {
        len: [1, 255],
      },
    },
    // 微信公众号/小程序appid
    appid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "appid",
      validate: {
        len: [1, 255],
        notEmpty: {
          msg: "请填入appid",
        },
      },
    },
    // 微信公众号/小程序appsecret
    appsecret: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "appsecret",
      validate: {
        len: [1, 255],
        notEmpty: {
          msg: "请填入appsecret",
        },
      },
    },
    // 加密盐值-初步用于appsecret
    salt: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "salt",
      validate: {
        len: [4, 64],
      },
    },
    // 微信公众号/小程序原始ID
    originid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "originid",
      validate: {
        len: [1, 255],
        notEmpty: {
          msg: "请填入原始ID",
        },
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
      type: DataTypes.BIGINT({
        length: 20
      }).UNSIGNED,
      allowNull: false,
      field: "created_time",
      validate: {
        isNumeric: true,
        len: [13, 13],
        notEmpty: {
          msg: "请填入创建时间",
        },
      },
    },
    // 更新时间
    updatedAt: {
      type: DataTypes.BIGINT({
        length: 20
      }).UNSIGNED,
      allowNull: true,
      field: "updated_time",
      validate: {
        isNumeric: true,
        len: [13, 13],
      },
    },
  },
  {
    tableName: "wechat",
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
        fields: ["name"],
      },
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["hash"],
      },
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["appid"],
      },
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["originid"],
      },
    ],
    timestamps: true,
    sequelize: database,
  }
);
// 同步模型到数据库
// WechatModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default WechatModel;
