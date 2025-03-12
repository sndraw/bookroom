import { DataTypes, Model } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";

// 微信公众号/小程序-规则表
class WechatRuleModel extends Model { }
// 初始化model
WechatRuleModel.init(
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
    // 规则名称
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "name",
      validate: {
        len: [1, 255],
        notEmpty: {
          msg: "请填入规则名称",
        },
      },
    },
    // 规则类型
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "type",
      validate: {
        len: [1, 50],
        notEmpty: {
          msg: "请填入规则类型",
        },
      },
    },
    // 规则内容
    rule: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "rule",
      validate: {
        len: [1, 3000],
        notEmpty: {
          msg: "请填入规则内容",
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
    tableName: "wechat_rule",
    indexes: [
      {
        // 唯一
        unique: true,
        // 字段集合
        fields: ["id"],
      },
    ],
    timestamps: true,
    sequelize: database,
  }
);

// 同步模型到数据库
// WechatRuleModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default WechatRuleModel;
