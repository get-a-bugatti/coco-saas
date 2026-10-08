"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Organization.hasMany(models.OrganizationMembership, {
        foreignKey: "organization_id",
        as: "organizationMemberships",
        onDelete: "CASCADE",
      });

      Organization.hasMany(models.Project, {
        foreignKey: "organization_id",
        as: "projects",
        onDelete: "CASCADE",
      });

      Organization.hasMany(models.Team, {
        foreignKey: "organizationId",
        as: "teams",
        onDelete: "CASCADE",
      });

      Organization.hasMany(models.Role, {
        foreignKey: "organizationId",
        as: "roles",
        onDelete: "CASCADE",
      });

      Organization.belongsToMany(models.User, {
        through: models.OrganizationMembership,
        foreignKey: "organization_id",
        otherKey: "user_id",
        as: "members",
      });
    }
  }
  Organization.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    },
    {
      sequelize,
      modelName: "Organization",
      timestamps: true,
    }
  );
  return Organization;
};
