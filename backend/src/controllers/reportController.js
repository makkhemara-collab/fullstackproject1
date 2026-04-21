const { 
    Sale, 
    SaleItemDetail, 
    Order, 
    OrderItem, 
    MasterProduct, 
    Customer, 
    Category, 
    Brand,
    sequelize 
} = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const logError = require('../utils/logger');

// ================== DASHBOARD STATISTICS ==================

// Get dashboard overview stats
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const currentMonthSales = await Sale.findAll({
            where: { created_on: { [Op.gte]: startOfMonth } },
            order: [['created_on', 'DESC']]
        });

        // 🛡️ FIX: Added Number conversion and fallback to 0 to prevent NaN/500 errors
        const totalSales = currentMonthSales.reduce((sum, sale) => sum + (Number(sale?.amount) || 0), 0);

        const lastMonthSalesQuery = await Sale.findAll({
            where: {
                created_on: { [Op.gte]: startOfLastMonth, [Op.lte]: endOfLastMonth }
            }
        });
        
        const lastMonthSales = lastMonthSalesQuery.reduce((sum, sale) => sum + (Number(sale?.amount) || 0), 0);

        const salesChange = lastMonthSales > 0 
            ? (((totalSales - lastMonthSales) / lastMonthSales) * 100).toFixed(1) 
            : 0;

        const totalTransactions = currentMonthSales.length;
        const lastMonthTransactions = lastMonthSalesQuery.length;
        const transactionChange = lastMonthTransactions > 0 
            ? (((totalTransactions - lastMonthTransactions) / lastMonthTransactions) * 100).toFixed(1) 
            : 0;

        const products = await MasterProduct.findAll();
        // 🛡️ FIX: Ensure inventory math doesn't hit a null qty or cost
        const inventoryValue = products.reduce((sum, p) => sum + ((Number(p?.qty) || 0) * (Number(p?.unit_cost) || 0)), 0);

        const lowStockItems = await MasterProduct.count({ where: { qty: { [Op.lt]: 10 } } });
        const totalCustomers = await Customer.count();
        const totalProducts = await MasterProduct.count();
        const pendingOrders = await Sale.count({ where: { status: 'Pending' } });

        const recentTransactions = currentMonthSales.slice(0, 10).map(sale => ({
            sale_id: sale.sale_id,
            invoice_id: sale.invoice_id,
            amount: Number(sale.amount) || 0, // 👈 Safety first
            pay_method: sale.pay_method || 'N/A',
            order_type: sale.order_type || 'POS',
            created_on: sale.created_on
        }));

        res.json({
            success: true,
            data: {
                totalSales: totalSales.toFixed(2),
                salesChange: parseFloat(salesChange),
                totalTransactions,
                transactionChange: parseFloat(transactionChange),
                inventoryValue: inventoryValue.toFixed(2),
                lowStockItems,
                totalCustomers,
                totalProducts,
                pendingOrders,
                recentTransactions
            }
        });

    } catch (error) {
        // This will now print the EXACT reason for the 500 error in your terminal
        console.error("🚨 Dashboard Stats Crash:", error); 
        logError("reportController - getDashboardStats", error, res);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================== SALES REPORTS ==================

// Get sales summary by period (daily, weekly, monthly)
const getSalesSummary = async (req, res) => {
    try {
        const { period = 'daily', startDate, endDate } = req.query;
        
        let dateFilter = {};
        const now = new Date();
        
        if (startDate && endDate) {
            dateFilter = {
                created_on: {
                    [Op.gte]: new Date(startDate),
                    [Op.lte]: new Date(endDate)
                }
            };
        } else {
            // Default: last 30 days
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            dateFilter = {
                created_on: { [Op.gte]: thirtyDaysAgo }
            };
        }

        const orders = await Order.findAll({
            where: dateFilter,
            order: [['created_on', 'ASC']]
        });

        // Group by period
        const groupedData = {};
        orders.forEach(order => {
            let key;
            const date = new Date(order.created_on);
            
            if (period === 'daily') {
                key = date.toISOString().split('T')[0];
            } else if (period === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else if (period === 'monthly') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!groupedData[key]) {
                groupedData[key] = { date: key, sales: 0, orders: 0 };
            }
            groupedData[key].sales += order.amount || 0;
            groupedData[key].orders += 1;
        });

        const chartData = Object.values(groupedData);

        res.json({
            success: true,
            data: chartData,
            summary: {
                totalSales: orders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2),
                totalOrders: orders.length,
                averageOrderValue: orders.length > 0 
                    ? (orders.reduce((sum, o) => sum + (o.amount || 0), 0) / orders.length).toFixed(2)
                    : 0
            }
        });

    } catch (error) {
        logError("reportController - getSalesSummary", error, res);
    }
};

// Get sales by payment method
const getSalesByPaymentMethod = async (req, res) => {
    try {
        const orders = await Order.findAll({
            attributes: [
                'status_payment',
                [fn('COUNT', col('order_id')), 'count'],
                [fn('SUM', col('amount')), 'total']
            ],
            group: ['status_payment']
        });

        res.json({
            success: true,
            data: orders.map(o => ({
                method: o.status_payment,
                count: parseInt(o.getDataValue('count')),
                total: parseFloat(o.getDataValue('total') || 0).toFixed(2)
            }))
        });

    } catch (error) {
        logError("reportController - getSalesByPaymentMethod", error, res);
    }
};

// ================== PRODUCT REPORTS ==================

// Get top selling products
const getTopSellingProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const topProducts = await OrderItem.findAll({
            attributes: [
                'prd_id',
                [fn('SUM', col('qty')), 'totalQty'],
                [fn('SUM', literal('qty * unit_price')), 'totalRevenue']
            ],
            include: [{
                model: MasterProduct,
                attributes: ['prd_name', 'photo', 'unit_cost']
            }],
            group: ['prd_id', 'tbl_master_product.prd_id', 'tbl_master_product.prd_name', 'tbl_master_product.photo', 'tbl_master_product.unit_cost'],
            order: [[fn('SUM', col('qty')), 'DESC']],
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: topProducts.map(p => ({
                prd_id: p.prd_id,
                prd_name: p.tbl_master_product?.prd_name,
                photo: p.tbl_master_product?.photo,
                totalQty: parseInt(p.getDataValue('totalQty')),
                totalRevenue: parseFloat(p.getDataValue('totalRevenue') || 0).toFixed(2)
            }))
        });

    } catch (error) {
        logError("reportController - getTopSellingProducts", error, res);
    }
};

// Get low stock products
const getLowStockProducts = async (req, res) => {
    try {
        const { threshold = 10 } = req.query;

        const lowStockProducts = await MasterProduct.findAll({
            where: { qty: { [Op.lt]: parseInt(threshold) } },
            include: [
                { model: Category, attributes: ['desc'] },
                { model: Brand, attributes: ['desc'] }
            ],
            order: [['qty', 'ASC']]
        });

        res.json({
            success: true,
            data: lowStockProducts,
            count: lowStockProducts.length
        });

    } catch (error) {
        logError("reportController - getLowStockProducts", error, res);
    }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{
                model: MasterProduct,
                attributes: ['prd_id']
            }]
        });

        const data = categories.map(cat => ({
            category: cat.name,
            code: cat.code,
            productCount: cat.tbl_master_products?.length || 0
        }));

        res.json({
            success: true,
            data
        });

    } catch (error) {
        logError("reportController - getProductsByCategory", error, res);
    }
};

// ================== INVENTORY SUMMARY (SAFE VERSION) ==================
const getInventorySummary = async (req, res) => {
    try {
        const products = await MasterProduct.findAll({
            include: [
                // 🛡️ FIX: Removed 'name' because your DB uses 'desc'
                { model: Category, attributes: ['code', 'desc'] }, 
                { model: Brand, attributes: ['code', 'desc'] }
            ]
        });

        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + (Number(p?.qty) || 0), 0);
        
        const totalValueNum = products.reduce((sum, p) => {
            const qty = Number(p?.qty) || 0;
            const cost = Number(p?.unit_cost) || 0;
            return sum + (qty * cost);
        }, 0);

        const lowStock = products.filter(p => (Number(p?.qty) || 0) < 10).length;
        const outOfStock = products.filter(p => (Number(p?.qty) || 0) === 0).length;

        const byCategory = {};
        products.forEach(p => {
            // 🛡️ FIX: Use p.tbl_category.desc (the correct column name)
            const catName = p.tbl_category?.desc || 'Uncategorized';
            
            if (!byCategory[catName]) {
                byCategory[catName] = { count: 0, stock: 0, value: 0 };
            }
            byCategory[catName].count += 1;
            byCategory[catName].stock += (Number(p?.qty) || 0);
            byCategory[catName].value += (Number(p?.qty) || 0) * (Number(p?.unit_cost) || 0);
        });

        res.json({
            success: true,
            data: {
                totalProducts,
                totalStock,
                totalValue: totalValueNum.toFixed(2),
                lowStock,
                outOfStock,
                byCategory: Object.entries(byCategory).map(([name, data]) => ({
                    category: name,
                    ...data,
                    value: Number(data.value).toFixed(2)
                }))
            }
        });

    } catch (error) {
        console.error("🚨 Inventory Report Crash:", error.message);
        
        // 🛡️ FIX: Only send ONE response. If logError sends a response, don't send another.
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                message: "Inventory calculation failed: " + error.message 
            });
        }
    }
};

// ================== ORDER REPORTS ==================

// Get recent orders
const getRecentOrders = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const orders = await Order.findAll({
            include: [{
                model: OrderItem,
                include: [{
                    model: MasterProduct,
                    attributes: ['prd_name', 'photo']
                }]
            }],
            order: [['created_on', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        logError("reportController - getRecentOrders", error, res);
    }
};

// Get orders summary
const getOrdersSummary = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [todayOrders, weekOrders, monthOrders, totalOrders] = await Promise.all([
            Order.findAll({ where: { created_on: { [Op.gte]: startOfToday } } }),
            Order.findAll({ where: { created_on: { [Op.gte]: startOfWeek } } }),
            Order.findAll({ where: { created_on: { [Op.gte]: startOfMonth } } }),
            Order.findAll()
        ]);

        res.json({
            success: true,
            data: {
                today: {
                    count: todayOrders.length,
                    amount: todayOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)
                },
                thisWeek: {
                    count: weekOrders.length,
                    amount: weekOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)
                },
                thisMonth: {
                    count: monthOrders.length,
                    amount: monthOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)
                },
                total: {
                    count: totalOrders.length,
                    amount: totalOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)
                }
            }
        });

    } catch (error) {
        logError("reportController - getOrdersSummary", error, res);
    }
};

// ================== CUSTOMER REPORTS ==================

// Get customer statistics
const getCustomerStats = async (req, res) => {
    try {
        const totalCustomers = await Customer.count();

        // Customers with orders
        const customersWithOrders = await Order.findAll({
            attributes: [[fn('DISTINCT', col('customer_id')), 'customer_id']],
            where: { customer_id: { [Op.ne]: null } }
        });

        // Top customers by order amount
        const topCustomers = await Order.findAll({
            attributes: [
                'customer_id',
                [fn('COUNT', col('order_id')), 'orderCount'],
                [fn('SUM', col('amount')), 'totalSpent']
            ],
            where: { customer_id: { [Op.ne]: null } },
            include: [{
                model: Customer,
                attributes: ['fullname', 'gmail', 'phone']
            }],
            group: ['customer_id', 'tbl_customer.customer_id', 'tbl_customer.fullname', 'tbl_customer.gmail', 'tbl_customer.phone'],
            order: [[fn('SUM', col('amount')), 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                totalCustomers,
                activeCustomers: customersWithOrders.length,
                topCustomers: topCustomers.map(c => ({
                    customer_id: c.customer_id,
                    fullname: c.tbl_customer?.fullname,
                    gmail: c.tbl_customer?.gmail,
                    orderCount: parseInt(c.getDataValue('orderCount')),
                    totalSpent: parseFloat(c.getDataValue('totalSpent') || 0).toFixed(2)
                }))
            }
        });

    } catch (error) {
        logError("reportController - getCustomerStats", error, res);
    }
};

// ================== SALE TABLE REPORTS ==================

// Get monthly sales data from tbl_sale
const getMonthlySales = async (req, res) => {
    try {
        const { year } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        // Get sales grouped by month for the target year
        const sales = await Sale.findAll({
            attributes: [
                [fn('MONTH', col('sale_date')), 'month'],
                [fn('SUM', col('amount')), 'totalAmount'],
                [fn('COUNT', col('sale_id')), 'totalTransactions']
            ],
            where: {
                sale_date: {
                    [Op.gte]: new Date(targetYear, 0, 1),
                    [Op.lt]: new Date(targetYear + 1, 0, 1)
                }
            },
            group: [fn('MONTH', col('sale_date'))],
            order: [[fn('MONTH', col('sale_date')), 'ASC']]
        });

        // Create array for all 12 months with default 0 values
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            monthName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            totalAmount: 0,
            totalTransactions: 0
        }));

        // Fill in actual data
        sales.forEach(sale => {
            const monthIndex = parseInt(sale.getDataValue('month')) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyData[monthIndex].totalAmount = parseFloat(sale.getDataValue('totalAmount') || 0);
                monthlyData[monthIndex].totalTransactions = parseInt(sale.getDataValue('totalTransactions') || 0);
            }
        });

        res.json({
            success: true,
            year: targetYear,
            data: monthlyData
        });

    } catch (error) {
        logError("reportController - getMonthlySales", error, res);
    }
};

// Get sales by payment method from tbl_sale
const getSalesPaymentMethodFromSale = async (req, res) => {
    try {
        const { year } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        const salesByPayment = await Sale.findAll({
            attributes: [
                'pay_method',
                [fn('SUM', col('amount')), 'totalAmount'],
                [fn('COUNT', col('sale_id')), 'totalTransactions']
            ],
            where: {
                sale_date: {
                    [Op.gte]: new Date(targetYear, 0, 1),
                    [Op.lt]: new Date(targetYear + 1, 0, 1)
                }
            },
            group: ['pay_method']
        });

        res.json({
            success: true,
            year: targetYear,
            data: salesByPayment.map(s => ({
                payment_method: s.pay_method || 'Unknown',
                totalAmount: parseFloat(s.getDataValue('totalAmount') || 0),
                totalTransactions: parseInt(s.getDataValue('totalTransactions') || 0)
            }))
        });

    } catch (error) {
        logError("reportController - getSalesPaymentMethodFromSale", error, res);
    }
};

// Get daily sales for current month from tbl_sale
const getDailySales = async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
        const targetYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0);

        const sales = await Sale.findAll({
            attributes: [
                [fn('DAY', col('sale_date')), 'day'],
                [fn('SUM', col('amount')), 'totalAmount'],
                [fn('COUNT', col('sale_id')), 'totalTransactions']
            ],
            where: {
                sale_date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            },
            group: [fn('DAY', col('sale_date'))],
            order: [[fn('DAY', col('sale_date')), 'ASC']]
        });

        // Get number of days in the month
        const daysInMonth = endDate.getDate();
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            totalAmount: 0,
            totalTransactions: 0
        }));

        // Fill in actual data
        sales.forEach(sale => {
            const dayIndex = parseInt(sale.getDataValue('day')) - 1;
            if (dayIndex >= 0 && dayIndex < daysInMonth) {
                dailyData[dayIndex].totalAmount = parseFloat(sale.getDataValue('totalAmount') || 0);
                dailyData[dayIndex].totalTransactions = parseInt(sale.getDataValue('totalTransactions') || 0);
            }
        });

        res.json({
            success: true,
            month: targetMonth + 1,
            year: targetYear,
            data: dailyData
        });

    } catch (error) {
        logError("reportController - getDailySales", error, res);
    }
};

module.exports = {
    // Dashboard
    getDashboardStats,
    
    // Sales
    getSalesSummary,
    getSalesByPaymentMethod,
    
    // Products
    getTopSellingProducts,
    getLowStockProducts,
    getProductsByCategory,
    getInventorySummary,
    
    // Orders
    getRecentOrders,
    getOrdersSummary,
    
    // Customers
    getCustomerStats,

    // Sale Table Reports
    getMonthlySales,
    getSalesPaymentMethodFromSale,
    getDailySales
};
