import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface SessionAttributes {
  id: number;
  session_id: string;
  customer_nickname: string | null;
  customer_user_id: string | null;
  customer_email: string | null;
  agent_nickname: string | null;
  agent_user_id: string | null;
  is_resolved: boolean;
  resolved_at: Date | null;
  messages: any;
  conversation_text: string;
  last_message_content: string | null;
  ai_analyzed: boolean;
  ai_summary: string | null;
  category: string | null;
  customer_sentiment: number | null;
  urgency_score: number | null;
  total_messages: number | null;
  first_message_at: Date | null;
  last_message_at: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SessionCreationAttributes = Optional<SessionAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: number;
  public session_id!: string;
  public customer_nickname!: string | null;
  public customer_user_id!: string | null;
  public customer_email!: string | null;
  public agent_nickname!: string | null;
  public agent_user_id!: string | null;
  public is_resolved!: boolean;
  public resolved_at!: Date | null;
  public messages!: any;
  public conversation_text!: string;
  public last_message_content!: string | null;
  public ai_analyzed!: boolean;
  public ai_summary!: string | null;
  public category!: string | null;
  public customer_sentiment!: number | null;
  public urgency_score!: number | null;
  public total_messages!: number | null;
  public first_message_at!: Date | null;
  public last_message_at!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Session {
    Session.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      customer_nickname: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customer_user_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customer_email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      agent_nickname: {
        type: DataTypes.STRING,
        allowNull: true
      },
      agent_user_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_resolved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      resolved_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      messages: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      conversation_text: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
      },
      last_message_content: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ai_analyzed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      ai_summary: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customer_sentiment: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      urgency_score: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      total_messages: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      first_message_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      last_message_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'Session',
      tableName: 'sessions',
      timestamps: true
    });

    return Session;
  }
}