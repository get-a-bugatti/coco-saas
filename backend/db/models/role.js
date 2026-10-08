"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Role.hasMany(models.RolePermission, {
        foreignKey: "roleId",
        as: "rolePermissions",
      });

      Role.belongsTo(models.Organization, {
        foreignKey: "organizationId",
        as: "organization",
      });

      Role.belongsToMany(models.Permission, {
        through: "RolePermission",
        foreignKey: "roleId",
        otherKey: "permissionId",
        as: "permissions",
      });

      Role.belongsToMany(models.User, {
        through: "OrganizationMembership",
        foreignKey: "roleId",
        otherKey: "userId",
        as: "roles",
      });

      Role.belongsToMany(models.User, {
        through: "TeamMembership",
        foreignKey: "roleId",
        otherKey: "userId",
        as: "teamUsers",
      });

      Role.belongsToMany(models.User, {
        through: "ProjectMembership",
        foreignKey: "roleId",
        otherKey: "userId",
        as: "projectUsers",
      });
    }
  }
  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      organizationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "organizations",
          key: "id",
        },
      },
      name: { type: DataTypes.STRING(30), allowNull: false }, // "Org admin", "Project lead", "Contributor"
      slug: {
        type: DataTypes.STRING(30), // e.g., "org_admin", "project_lead", "contributor"
        allowNull: false,
      },
      scope: {
        type: DataTypes.ENUM("organization", "project", "team"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Role",
    }
  );
  return Role;
};
