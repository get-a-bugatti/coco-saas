"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Project.belongsTo(models.Organization, {
        foreignKey: "organizationId",
        as: "organization",
        onDelete: "CASCADE",
      });

      Project.hasMany(models.ProjectMembership, {
        foreignKey: "projectId",
        as: "projectMemberships",
      });

      Project.hasMany(models.Task, {
        foreignKey: "projectId",
        as: "tasks",
      });

      Project.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "createdByUser",
      });

      Project.belongsToMany(models.User, {
        through: models.ProjectMembership, // or "ProjectMembership"
        foreignKey: "projectId", // Key on ProjectMembership pointing to Project
        otherKey: "userId", // Key on ProjectMembership pointing to User
        as: "members", // Clear property alias for include queries
      });
    }
  }
  Project.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: DataTypes.STRING(30), allowNull: false },
      description: { type: DataTypes.STRING(250), allowNull: false },
      organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "organizations",
          key: "id",
        },
      },
      isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Project",
      timestamps: true,
    }
  );
  return Project;
};
