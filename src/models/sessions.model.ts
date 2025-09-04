import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface SessionAttributes {
  id: number;
  session_id: string;
  customer_nickname: string;
  customer_user_id: string;
  customer_email: string;
  agent_nickname: string;
  agent_user_id: string;

  is_resolved: boolean;
  resolved_at: Date;

  messages: JSON;
  conversation_text: string;
  last_message_content: string;

  ai_analyzed: boolean;
  ai_summary: string;

  category: string;

  customer_sentiment: number;
  urgency_score: number;

  total_messages: number;
  first_message_at: Date;
  last_message_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SessionCreationAttributes = Optional<SessionAttributes, 'id' | 'session_id'>;

export class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: number;
  public session_id!: string;
  public customer_nickname!: string;
  public customer_user_id!: string;
  public customer_email!: string;
  public agent_nickname!: string;
  public agent_user_id!: string;

  public is_resolved!: boolean;
  public resolved_at!: Date;

  public messages!: JSON;
  public conversation_text!: string;
  public last_message_content!: string;

  public ai_analyzed!: boolean;
  public ai_summary!: string;

  public category!: string;

  public customer_sentiment!: number;
  public urgency_score!: number;

  public total_messages!: number;
  public first_message_at!: Date;
  public last_message_at!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Session {
    Session.init(
      {
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
          allowNull: false,
        },
        customer_user_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        customer_email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        agent_nickname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        agent_user_id: {
          type: DataTypes.STRING,
          allowNull: false,
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
        },
        conversation_text: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        last_message_content: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        ai_analyzed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        ai_summary: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        category: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        customer_sentiment: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        urgency_score: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        total_messages: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        first_message_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        last_message_at: {
          type: DataTypes.DATE,
          allowNull: true,
        }
      },
      {
        sequelize,
        tableName: 'sessions',
      }
    );
    return Session;
  }
}
