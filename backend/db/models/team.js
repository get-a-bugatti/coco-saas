"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Team.belongsTo(models.Organization, {
        foreignKey: "organizationId",
        as: "organization",
        onDelete: "CASCADE",
      });

      Team.hasMany(models.ProjectMembership, {
        foreignKey: "teamId",
        as: "projectMemberships",
      });

      Team.hasMany(models.Task, {
        foreignKey: "assignedTeam",
        as: "assignedTasks",
      });

      Team.belongsToMany(models.User, {
        through: models.TeamMembership,
        foreignKey: "teamId", // Foreign key in team_memberships pointing to Team
        otherKey: "userId", // Foreign key in team_memberships pointing to User
        as: "members", // Output alias: team.members
      });

      Team.hasMany(models.TeamMembership, {
        foreignKey: "teamId",
        as: "teamMemberships",
      });
    }
  }
  Team.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: DataTypes.STRING(20), allowNull: false },
      organizationId: { type: DataTypes.UUID, allowNull: false },
    },
    {
      sequelize,
      modelName: "Team",
      timestamps: true,
      updatedAt: false,
    }
  );
  return Team;
};
