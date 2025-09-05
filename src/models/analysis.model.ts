import { DataTypes, Model, Optional, Sequelize, QueryTypes } from 'sequelize';

interface AnalysisAttributes {
  id: number;
  session_id: string;
  openai_model: string;
  customer_needs: string;
  pain_points: string;
  customer_mood: string;
  satisfaction_level: number;
  conversation_summary: string;
  main_topic: string;
  resolution_status: string;
  mentioned_products: string;
  technical_issues: string;
  feature_requests: string;
  openai_response: any;
  summary_embedding: number[] | null; // Vector embedding
  createdAt?: Date;
  updatedAt?: Date;
}

export type AnalysisCreationAttributes = Optional<AnalysisAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Analysis extends Model<AnalysisAttributes, AnalysisCreationAttributes> implements AnalysisAttributes {
  public id!: number;
  public session_id!: string;
  public openai_model!: string;
  public customer_needs!: string;
  public pain_points!: string;
  public customer_mood!: string;
  public satisfaction_level!: number;
  public conversation_summary!: string;
  public main_topic!: string;
  public resolution_status!: string;
  public mentioned_products!: string;
  public technical_issues!: string;
  public feature_requests!: string;
  public openai_response!: any;
  public summary_embedding!: number[] | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Analysis {
    Analysis.init({
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
      openai_model: {
        type: DataTypes.STRING,
        allowNull: false
      },
      customer_needs: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      pain_points: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      customer_mood: {
        type: DataTypes.STRING,
        allowNull: false
      },
      satisfaction_level: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      conversation_summary: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      main_topic: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      resolution_status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mentioned_products: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      technical_issues: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      feature_requests: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      openai_response: {
        type: DataTypes.JSON,
        allowNull: false
      },
      summary_embedding: {
        type: 'vector(1536)', // pgvector type
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
      modelName: 'Analysis',
      tableName: 'analyses',
      timestamps: true
    });

    return Analysis;
  }

  public static async findSimilar(sessionId: string, limit: number = 5): Promise<any[]> {
    const results = await this.sequelize!.query(`
      WITH target_session AS (
        SELECT summary_embedding
        FROM analyses
        WHERE session_id = :sessionId
        AND summary_embedding IS NOT NULL
      )
      SELECT 
        a.session_id,
        a.conversation_summary,
        a.customer_mood,
        a.main_topic,
        1 - (a.summary_embedding <=> target_session.summary_embedding) as similarity_score
      FROM analyses a
      CROSS JOIN target_session
      WHERE a.session_id != :sessionId
        AND a.summary_embedding IS NOT NULL
      ORDER BY a.summary_embedding <=> target_session.summary_embedding
      LIMIT :limit
    `, {
      replacements: { sessionId, limit },
      type: QueryTypes.SELECT
    });

    return results;
  }
}