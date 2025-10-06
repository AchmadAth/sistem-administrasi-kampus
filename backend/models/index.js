const { sequelize } = require('../config/database');
const User = require('./User');

// Define associations here when more models are added
const models = {
  User,
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
