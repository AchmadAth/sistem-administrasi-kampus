const { sequelize } = require('../config/database');
const User = require('./User');
const Letter = require('./Letter');

// Define associations
User.hasMany(Letter, { foreignKey: 'userId', as: 'letters' });
Letter.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Letter.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Letter.belongsTo(User, { foreignKey: 'rejectedBy', as: 'rejector' });

const models = {
  User,
  Letter,
};

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
  }
};

module.exports = {
  ...models,
  sequelize,
  syncDatabase,
};
