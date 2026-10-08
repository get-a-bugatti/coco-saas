"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserProfile.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });
    }
  }
  UserProfile.init(
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      avatar: { type: DataTypes.TEXT, allowNull: false },
      cover_image: { type: DataTypes.TEXT },
      bio: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: "UserProfile",
      tableName: "user_profiles",
      timestamps: true,
    }
  );
  return UserProfile;
};
