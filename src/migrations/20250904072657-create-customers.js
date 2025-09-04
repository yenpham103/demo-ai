'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('customers', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      primary_nickname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_messages: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      first_contact: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_contact: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      overall_satisfaction: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      common_issues: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      behavior_pattern: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_embedding: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('customers');
  },
};
