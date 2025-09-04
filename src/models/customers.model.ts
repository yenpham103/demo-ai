import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface CustomerAttributes {
  id: number;
  customer_key: string;
  primary_nickname: string;
  total_sessions: number;
  total_messages: number;
  first_contact: string;
  last_contact: string;

  overall_satisfaction: number;
  common_issues: string;
  behavior_pattern: string;

  profile_embedding: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type CustomerCreationAttributes = Optional<CustomerAttributes, 'id' | 'customer_key'>;

export class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public id!: number;
  public customer_key!: string;
  public primary_nickname!: string;
  public total_sessions!: number;
  public total_messages!: number;
  public first_contact!: string;
  public last_contact!: string;

  public overall_satisfaction!: number;
  public common_issues!: string;
  public behavior_pattern!: string;

  public profile_embedding!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Customer {
    Customer.init(
      {
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
        }
      },
      {
        sequelize,
        tableName: 'customers',
      }
    );
    return Customer;
  }
}
