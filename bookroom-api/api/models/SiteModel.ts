import { DataTypes, Model } from "sequelize";
import database from "../common/database";
import { StatusEnum } from "@/constants/DataMap";
import { StatusModelRule } from "./rule";

// 用户表
class SiteModel extends Model {
}
// 初始化model
SiteModel.init(
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
    // 安装状态
    setup: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "setup",
      defaultValue: 1,
      validate: {
        isIn: StatusModelRule.isIn,
        notEmpty: {
            msg: "请填入安装状态",
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
    tableName: "site",
    // 索引
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
// SiteModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default SiteModel;
