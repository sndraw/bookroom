import { DataTypes, Model, Op } from "sequelize";
import database from "../common/database";
import { StatusEnum } from "@/constants/DataMap";
import { StatusModelRule } from "./rule";

// 微信公众号/小程序-用户信息表
class WechatUserInfoModel extends Model {
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
  }
}
// 初始化model
WechatUserInfoModel.init(
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
    // 是否订阅该公众号标识,-1为否，1为是
    subscribe: {
      type: DataTypes.INTEGER({
        length: 2
      }),
      allowNull: false,
      field: "subscribe",
      defaultValue: 1,
      validate: {
        isIn: StatusModelRule.isIn,
        notEmpty: {
          msg: "请填入状态",
        },
      },
    },
    // 昵称
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "nickname",
      validate: {
        len: [1, 50],
        notEmpty: {
          msg: "请填入昵称",
        },
      },
    },
    // 性别，1是男性，2是女性，0是未知
    sex: {
      type: DataTypes.INTEGER({
        length: 2
      }),
      allowNull: false,
      field: "sex",
      defaultValue: 0,
      validate: {
        isNumeric: true,
        min: 0,
        max: 2,
      },
    },
    // 用户所在城市
    city: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "city",
      validate: {
        len: [0, 50],
      },
    },
    // 用户所在国家
    country: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "country",
      validate: {
        len: [0, 50],
      },
    },
    // 用户所在国家
    province: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "province",
      validate: {
        len: [0, 50],
      },
    },
    // 用户所在国家
    language: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "language",
      validate: {
        len: [1, 50],
      },
    },
    // 用户头像
    headimgurl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "headimgurl",
      validate: {
        len: [0, 255],
      },
    },
    // 微信unionid
    unionid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "unionid",
      validate: {
        len: [1, 255],
      },
    },
    // 公众号运营者对粉丝的备注
    remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "remark",
      validate: {
        len: [0, 255],
      },
    },
    // 用户所在的分组ID
    groupid: {
      type: DataTypes.INTEGER({
        length: 5
      }).UNSIGNED,
      allowNull: false,
      field: "groupid",
      defaultValue: 0,
      validate: {
        isNumeric: true,
        len: [1, 5],
      },
    },
    // 用户被打上的标签ID列表
    tagid_list: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "tagid_list",
      validate: {
        len: [0, 255],
      },
    },
    // 用户被打上的标签ID列表
    qr_scene: {
      type: DataTypes.INTEGER({
        length: 10
      }).UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      field: "qr_scene",
      validate: {
        len: [1, 10],
      },
    },
    // 二维码扫码场景描述
    qr_scene_str: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "qr_scene_str",
      validate: {
        len: [0, 50],
      },
    },
    // 返回用户关注的渠道来源
    subscribe_scene: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "subscribe_scene",
      validate: {
        len: [1, 50],
      },
    },
    // 创建时间
    subscribe_time: {
      type: DataTypes.BIGINT({
        length: 20
      }).UNSIGNED,
      allowNull: true,
      field: "subscribe_time",
      validate: {
        isNumeric: true,
        len: [13, 13],
      },
    },
    // 拉取列表的最后一个用户的OPENID
    next_openid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "next_openid",
      validate: {
        len: [1, 255],
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
    tableName: "wechat_user_info",
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
// WechatUserInfoModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default WechatUserInfoModel;
