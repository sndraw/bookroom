import { DataTypes, Model } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";

// 微信公众号/小程序-用户标签表
class WechatMenuModel extends Model { }
// 初始化model
WechatMenuModel.init(
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
    // 标签名称
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "name",
      validate: {
        len: [1, 255],
        notEmpty: {
          msg: "请填入标签名称",
        },
      },
    },
    // 标签类型
    type: {
      type: DataTypes.INTEGER({
        length: 2
      }).UNSIGNED,
      allowNull: false,
      field: "type",
      defaultValue: 1,
      validate: {
        isNumeric: true,
        min: 1,
        max: 2,
      },
    },
    // 标签规则
    rule: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "rule",
      validate: {
        len: [1, 3000],
        notEmpty: {
          msg: "请填入标签规则",
        },
      },
    },
    // 标签ID
    tagId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "tag_id",
      validate: {
        is: ["^[0-9]+$", "i"],
        len: [0, 64],
      },
    },
    // 标签下粉丝数量
    users_count: {
      type: DataTypes.BIGINT({
        length: 20,
      }).UNSIGNED,
      defaultValue: 0,
      allowNull: false,
      field: "users_count",
      validate: {
        isNumeric: true,
        len: [1, 20],
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
    tableName: "wechat_user_tag",
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
// WechatMenuModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default WechatMenuModel;
