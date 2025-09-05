'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('sessions', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customer_nickname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customer_user_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customer_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      agent_nickname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      agent_user_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_resolved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      resolved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      messages: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '[]',
      },
      conversation_text: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      last_message_content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ai_analyzed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ai_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customer_sentiment: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      urgency_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_messages: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      first_message_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_message_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      work_day: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      has_files: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      response_time_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });

    await queryInterface.addIndex('sessions', ['session_id']);
    await queryInterface.addIndex('sessions', ['work_day']);
    await queryInterface.addIndex('sessions', ['ai_analyzed']);
    await queryInterface.addIndex('sessions', ['category']);
    await queryInterface.addIndex('sessions', ['first_message_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('sessions');
  },
};