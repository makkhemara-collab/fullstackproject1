require('dotenv').config();
const express = require('express');
const path = require('path');
const runMigrations = require('./src/config/migrate');
const cors = require('cors');

// Import routes
const categoryRoute = require('./src/route/categoryRoute');
const brandRoute = require('./src/route/brandRoute');
const productRoute = require('./src/route/productRoute');
const userRoutes = require('./src/route/userRoute');
const posSaleRoute = require('./src/route/posSaleRoute');
const paymentMethodRoute = require('./src/route/paymentMethodRoute');
const telegramConfigRoute = require('./src/route/telegramConfigRoute');
const setAlertRoute = require('./src/route/setAlertRoute');
const customerRoute = require('./src/route/customerRoute');
const customerOrderRoute = require('./src/route/customerOrderRoute');
const reportRoute = require('./src/route/reportRoute');
const tableRoute = require('./src/route/tableRoute'); 

const app = express();

// 🛡️ NO-RESTRICTION CORS: Allows your teacher to view from any URL
app.use(cors()); 

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🖼️ STATIC ASSETS: Opens the 'assets' folder to the internet
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
userRoutes(app);
categoryRoute(app);
brandRoute(app);
productRoute(app);
posSaleRoute(app);
paymentMethodRoute(app);
telegramConfigRoute(app);
setAlertRoute(app);
customerRoute(app);
customerOrderRoute(app);
reportRoute(app);
tableRoute(app); 

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('\n🚀 Starting server...');
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`\n✓ Server is running on port ${PORT}\n`);
    });
  } catch (error) {
    console.error('\n✗ Failed to start server:');
    console.error(error);
    process.exit(1);
  }
};

startServer();