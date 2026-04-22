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

// require('dotenv').config();
// const { Sequelize } = require('sequelize');

// let sequelize;

// if (process.env.DB_URL) {
//   // 🚀 PRODUCTION: Render + Postgres
//   sequelize = new Sequelize(process.env.DB_URL, {
//     dialect: 'postgres',
//     protocol: 'postgres',
//     logging: false, 
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false 
//       }
//     }
//   });
//   console.log("📡 Connected to Render Postgres Database");
// } else {
//   // 💻 DEVELOPMENT: Local + MySQL (MAMP)
//   sequelize = new Sequelize(
//     process.env.DB_NAME || 'backend_pos_db',
//     process.env.DB_USER || 'root',
//     process.env.DB_PASSWORD || 'root', 
//     {
//       host: process.env.DB_HOST || 'localhost',
//       port: process.env.DB_PORT || 8889,
//       dialect: 'mysql'
//     }
//   );
//   console.log("🏠 Connected to Local MySQL Database");
// }

// module.exports = sequelize;

require('dotenv').config();
const { Sequelize } = require('sequelize');

// 🛡️ DIAGNOSTIC: This will tell us EXACTLY what Render sees
console.log("--- DATABASE CONNECTION DIAGNOSTIC ---");
console.log("DB_URL variable found:", process.env.DB_URL ? "YES" : "NO");
console.log("DATABASE_URL variable found:", process.env.DATABASE_URL ? "YES" : "NO");

const connectionString = process.env.DB_URL || process.env.DATABASE_URL;

let sequelize;

if (connectionString) {
  sequelize = new Sequelize(connectionString, {
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
  console.log("📡 SUCCESS: Attempting to connect to Render Postgres...");
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'backend_pos_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root', 
    {
      host: 'localhost',
      dialect: 'mysql'
    }
  );
  console.log("🏠 NOTICE: No cloud URL found. Defaulting to Local MySQL.");
}

module.exports = sequelize;