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

if (process.env.DB_URL) {
  // 🚀 PRODUCTION: Render + Postgres
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, 
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    }
  });
  console.log("📡 Connected to Render Postgres Database");
} else {
  // 💻 DEVELOPMENT: Local + MySQL (MAMP)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'backend_pos_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root', 
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 8889,
      dialect: 'mysql'
    }
  );
  console.log("🏠 Connected to Local MySQL Database");
}

module.exports = sequelize;