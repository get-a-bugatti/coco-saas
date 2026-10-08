"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TaskComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      TaskComment.belongsTo(models.Task, {
        foreignKey: "taskId",
        as: "task",
        onDelete: "CASCADE",
      });

      TaskComment.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });
    }
  }
  TaskComment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      taskId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "tasks",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      comment: { type: DataTypes.STRING(250), allowNull: false },
    },
    {
      sequelize,
      modelName: "TaskComment",
    }
  );
  return TaskComment;
};
