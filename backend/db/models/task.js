"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // 1. Parent Project Association
      Task.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
        onDelete: "CASCADE",
      });

      // 2. Creator User Association
      Task.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "createdByUser",
      });

      // 3. Optional Team Assignment
      Task.belongsTo(models.Team, {
        foreignKey: "assignedTeam",
        as: "team",
      });

      // 4. Optional User Assignment
      Task.belongsTo(models.User, {
        foreignKey: "assignedUser",
        as: "assignee",
      });

      // 5. Task Comments
      Task.hasMany(models.TaskComment, {
        foreignKey: "taskId",
        as: "comments",
      });
    }
  }
  Task.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: DataTypes.STRING(20), allowNull: false },
      description: { type: DataTypes.STRING(250), allowNull: false },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
      },

      // Todo: Implement rule such that either assignedTeam or assignedUser
      // can be true at a time
      assignedTeam: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "teams",
          key: "id",
        },
      },
      assignedUser: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      createdBy: {
        type: DataTypes.UUID,
        references: {
          model: "users",
          key: "id",
        },
      },
      priority: { type: DataTypes.ENUM("low", "medium", "high") },
      status: {
        type: DataTypes.ENUM("to-do", "in-progress", "completed"),
        defaultValue: "to-do",
      },
      dueDate: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "Task",
      timestamps: true,
      validate: {
        eitherTeamOrUser() {
          const hasTeam =
            this.assignedTeam !== null && this.assignedTeam !== undefined;
          const hasUser =
            this.assignedUser !== null && this.assignedUser !== undefined;

          if (hasTeam && hasUser) {
            throw new Error(
              "A task cannot be assigned to both a team and an individual user."
            );
          }
          if (!hasTeam && !hasUser) {
            throw new Error(
              "A task must be assigned to either a team or an individual user."
            );
          }
        },
      },
    }
  );
  return Task;
};
