// require('dotenv').config();
// const { Sequelize } = require('sequelize');
// //production database configuration

// // const sequelize = new Sequelize(
// //   process.env.DATABASE_URL || 'mysql://root:IYgNjWfQnleWHZdUbxMbvYHaFypReXRU@mysql.railway.internal:3306/railway',
// //   {
// //     dialect: 'mysql'
// //   }
// // );

// // Old localhost connection
// const sequelize = new Sequelize(
//   process.env.DB_NAME || 'backend_pos_db',
//   process.env.DB_USER || 'root',
//   process.env.DB_PASSWORD || '',
//   {
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 3306,
//     dialect: process.env.DB_DIALECT || 'mysql'
//   }
// );

// module.exports = sequelize;

require('dotenv').config();
const { Sequelize } = require('sequelize');

let sequelize;

// 🚀 1. Check if we are on Render (using the DB_URL variable)
if (process.env.DB_URL) {
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres', // 🔥 Must be postgres for Render
    protocol: 'postgres',
    logging: false, 
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // 🔥 Required for Render Free Tier
      }
    }
  });
  console.log("📡 Connected to Render Postgres Database");
} else {
  // 💻 2. Fallback to your local MAMP / MySQL settings
  sequelize = new Sequelize(
    process.env.DB_NAME || 'backend_pos_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root', // MAMP default is usually 'root'
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 8889, // MAMP default port
      dialect: 'mysql'
    }
  );
  console.log("🏠 Connected to Local MySQL Database");
}

module.exports = sequelize;