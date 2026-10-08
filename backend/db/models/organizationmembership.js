"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrganizationMembership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // write for Organization membership to which Organization relation.
      OrganizationMembership.belongsTo(models.Organization, {
        foreignKey: "organization_id",
        as: "organization",
        onDelete: "CASCADE",
      });

      OrganizationMembership.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      OrganizationMembership.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
      });
    }
  }
  OrganizationMembership.init(
    {
      organizationId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: "organizations",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
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
        defaultValue: sequelize.fn("NOW"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrganizationMembership",
    }
  );
  return OrganizationMembership;
};
