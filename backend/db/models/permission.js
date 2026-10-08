"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Permission.belongsToMany(models.Role, {
        through: "RolePermission",
        foreignKey: "permission_id",
        otherKey: "role_id",
        as: "roles",
      });

      Permission.hasMany(models.RolePermission, {
        foreignKey: "permission_id",
        as: "rolePermissions",
      });
    }
  }

  Permission.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      description: { type: DataTypes.STRING(150) },
    },
    {
      sequelize,
      modelName: "Permission",
    }
  );
  return Permission;
};
