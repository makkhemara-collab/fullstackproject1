const { saleItem, getSale, updateSaleStatus } = require('../controllers/poSsaleController');

// 1. We name the function posSaleRoute
const posSaleRoute = (app) => {
    app.get('/api/sale', getSale);     // For the Kitchen Display
    app.post('/api/sale', saleItem);   // For the POS Checkout
    app.put('/api/sale/:sale_id', updateSaleStatus);
};

// 2. We export the exact same name
module.exports = posSaleRoute;