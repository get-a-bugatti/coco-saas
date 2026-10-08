"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RolePermission.belongsTo(models.Role, {
        foreignKey: "roleId",
      });

      RolePermission.belongsTo(models.Permission, {
        foreignKey: "permissionId",
      });

      RolePermission.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
      });

      RolePermission.belongsTo(models.Permission, {
        foreignKey: "permissionId",
        as: "permission",
      });
    }
  }
  RolePermission.init(
    {
      roleId: {
        type: DataTypes.UUID,
        references: {
          model: "roles",
          key: "id",
        },
        primaryKey: true,
      },
      permissionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id",
        },
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "RolePermission",
    }
  );
  return RolePermission;
};
