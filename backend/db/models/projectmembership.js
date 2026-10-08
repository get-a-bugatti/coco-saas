"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProjectMembership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProjectMembership.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });

      ProjectMembership.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      ProjectMembership.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
      });
    }
  }
  ProjectMembership.init(
    {
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn("NOW"),
      },
    },
    {
      sequelize,
      modelName: "ProjectMembership",
    }
  );
  return ProjectMembership;
};
