import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface AnalysisAttributes {
  id: number;
  session_id: string;
  openai_model: string;
  customer_needs: string;
  pain_points: string;
  customer_mood: string;
  satisfaction_level: number;
  conversation_summary: string;
  main_topics: string;
  resolution_status: string;
  analyzed_at: Date;
  mentioned_products: string;
  technical_issues: string;
  feature_requests: string;
  openai_response: JSON;
  summary_embedding: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AnalysisCreationAttributes = Optional<AnalysisAttributes, 'id'>;

export class Analysis extends Model<AnalysisAttributes, AnalysisCreationAttributes> implements AnalysisAttributes {
  public id!: number;
  public session_id!: string;
  public openai_model!: string;
  public customer_needs!: string;
  public pain_points!: string;
  public customer_mood!: string;
  public satisfaction_level!: number;
  public conversation_summary!: string;
  public main_topics!: string;
  public resolution_status!: string;
  public analyzed_at!: Date;
  public mentioned_products!: string;
  public technical_issues!: string;
  public feature_requests!: string;
  public openai_response!: JSON;
  public summary_embedding!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Analysis {
    Analysis.init(
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
        openai_model: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        customer_needs: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        pain_points: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        customer_mood: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        satisfaction_level: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        conversation_summary: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        main_topics: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        resolution_status: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        analyzed_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        mentioned_products: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        technical_issues: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        feature_requests: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        openai_response: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        summary_embedding: {
          type: DataTypes.STRING,
          allowNull: false,
        }
      },
      {
        sequelize,
        tableName: 'analyses',
      }
    );
    return Analysis;
  }
}
