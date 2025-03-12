import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";

// 微信公众号/小程序-用户表
class WechatUserModel extends Model {
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
WechatUserModel.init(
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
    // 微信公众号/小程序openid
    openid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "openid",
      validate: {
        len: [1, 255],
        notEmpty: {
          msg: "请填入openid",
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
    tableName: "wechat_user",
    indexes: [
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["id", "openid"],
      },
    ],
    timestamps: true,
    sequelize: database,
  }
);
// 同步模型到数据库
// WechatUserModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default WechatUserModel;
