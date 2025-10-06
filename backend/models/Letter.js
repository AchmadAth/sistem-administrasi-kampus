const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Letter = sequelize.define('Letter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  letterNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'letter_number',
  },
  letterType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'letter_type',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  additionalData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'additional_data',
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'approved_by',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at',
  },
  rejectedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'rejected_by',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  rejectedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'rejected_at',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason',
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
  },
}, {
  tableName: 'letters',
  timestamps: true,
  underscored: true,
});

module.exports = Letter;
