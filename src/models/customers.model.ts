import { DataTypes, Model, Optional, Sequelize, QueryTypes } from 'sequelize';

interface CustomerProfileAttributes {
  id: number;
  customer_key: string;
  primary_nickname: string | null;
  total_sessions: number;
  total_messages: number;
  first_contact: Date | null;
  last_contact: Date | null;
  overall_satisfaction: number | null;
  common_issues: string[];
  behavior_pattern: string;
  profile_embedding: number[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CustomerProfileCreationAttributes = Optional<CustomerProfileAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class CustomerProfile extends Model<CustomerProfileAttributes, CustomerProfileCreationAttributes> implements CustomerProfileAttributes {
  public id!: number;
  public customer_key!: string;
  public primary_nickname!: string | null;
  public total_sessions!: number;
  public total_messages!: number;
  public first_contact!: Date | null;
  public last_contact!: Date | null;
  public overall_satisfaction!: number | null;
  public common_issues!: string[];
  public behavior_pattern!: string;
  public profile_embedding!: number[] | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof CustomerProfile {
    CustomerProfile.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      customer_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      primary_nickname: {
        type: DataTypes.STRING,
        allowNull: true
      },
      total_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_messages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      first_contact: {
        type: DataTypes.DATE,
        allowNull: true
      },
      last_contact: {
        type: DataTypes.DATE,
        allowNull: true
      },
      overall_satisfaction: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      common_issues: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: []
      },
      behavior_pattern: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'new'
      },
      profile_embedding: {
        type: 'vector(1536)',
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
      modelName: 'CustomerProfile',
      tableName: 'customer_profiles',
      timestamps: true
    });

    return CustomerProfile;
  }

  public static async findSimilarCustomers(customerKey: string, limit: number = 5): Promise<any[]> {
    const results = await this.sequelize!.query(`
      WITH target_customer AS (
        SELECT profile_embedding
        FROM customer_profiles
        WHERE customer_key = :customerKey
        AND profile_embedding IS NOT NULL
      )
      SELECT 
        cp.customer_key,
        cp.primary_nickname,
        cp.behavior_pattern,
        cp.total_sessions,
        cp.overall_satisfaction,
        1 - (cp.profile_embedding <=> target_customer.profile_embedding) as similarity_score
      FROM customer_profiles cp
      CROSS JOIN target_customer
      WHERE cp.customer_key != :customerKey
        AND cp.profile_embedding IS NOT NULL
      ORDER BY cp.profile_embedding <=> target_customer.profile_embedding
      LIMIT :limit
    `, {
      replacements: { customerKey, limit },
      type: QueryTypes.SELECT
    });

    return results;
  }
}