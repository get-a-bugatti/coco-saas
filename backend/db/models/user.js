"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.UserProfile, {
        foreignKey: "user_id",
        as: "profile",
      });

      User.belongsToMany(models.Organization, {
        through: models.OrganizationMembership,
        foreignKey: "user_id",
        otherKey: "organization_id",
        as: "organizations",
      });

      User.hasMany(models.Task, {
        foreignKey: "assignedUser",
        as: "assignedTasks",
      });

      User.hasMany(models.Task, {
        foreignKey: "createdBy",
        as: "createdTasks",
      });

      User.hasMany(models.TaskComment, {
        foreignKey: "userId",
        as: "taskComments",
      });

      User.belongsToMany(models.Team, {
        through: models.TeamMembership,
        foreignKey: "userId",
        otherKey: "teamId",
        as: "teams",
      });

      User.hasMany(models.Organization, {
        foreignKey: "createdBy",
        as: "createdOrganizations",
      });

      User.hasMany(models.OrganizationMembership, {
        foreignKey: "userId",
        as: "organizationMemberships",
      });

      User.hasMany(models.TeamMembership, {
        foreignKey: "userId",
        as: "teamMemberships",
      });

      User.belongsToMany(models.Project, {
        through: models.ProjectMembership,
        foreignKey: "userId",
        otherKey: "projectId",
        as: "projects",
      });

      User.hasMany(models.Project, {
        foreignKey: "createdBy",
        as: "createdProjects",
      });

      User.hasMany(models.ProjectMembership, {
        foreignKey: "userId",
        as: "projectMemberships",
      });

      User.belongsToMany(models.Role, {
        through: models.OrganizationMembership,
        foreignKey: "userId",
        otherKey: "roleId",
        as: "roles",
      });

      User.belongsToMany(models.Role, {
        through: models.TeamMembership,
        foreignKey: "userId",
        otherKey: "roleId",
        as: "teamRoles",
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
          if (value) {
            this.setDataValue("email", value.trim().toLowerCase());
          }
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
      },
    }
  );
  return User;
};
