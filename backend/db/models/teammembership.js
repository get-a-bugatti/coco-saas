"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TeamMembership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      TeamMembership.belongsTo(models.Team, {
        foreignKey: "teamId",
        as: "team",
      });

      TeamMembership.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      TeamMembership.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
      });
    }
  }
  TeamMembership.init(
    {
      teamId: {
        type: DataTypes.UUID,
        references: {
          model: "teams",
          key: "id",
        },
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        references: {
          model: "users",
          key: "id",
        },
        primaryKey: true,
      },
      roleId: { type: DataTypes.STRING, allowNull: false },
      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn("NOW"),
      },
    },
    {
      sequelize,
      modelName: "TeamMembership",
    }
  );
  return TeamMembership;
};
