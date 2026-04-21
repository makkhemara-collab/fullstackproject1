const { Order, OrderItem, MasterProduct, Customer, Sale, SaleItemDetail } = require('../models');
const logError = require('../utils/logger');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
require('dotenv').config();

// Token secret (matching middleware)
const TOKEN_SECRET = process.env.SECRET_KEY || "ICE_TEA_SECRET_KEY2376428343284jkfsdf";

// Helper function to get customer from token
const getCustomerFromToken = (req) => {
    const authorization = req.headers.authorization;
    if (!authorization) return null;
    
    const token = authorization.split(" ")[1];
    if (!token) return null;
    
    try {
        return jwt.verify(token, TOKEN_SECRET);
    } catch (error) {
        return null;
    }
};

// Generate unique order ID
const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `ORD${timestamp}${random}`.toUpperCase();
};

// Place a new order (Checkout)
const placeOrder = async (req, res) => {
    try {
        const customer = getCustomerFromToken(req);
        
        const { email, fullname, adress, postalcode, status_payment, items } = req.body;

        if (!email || !fullname || !adress || !postalcode) {
            return res.status(400).json({ success: false, message: 'Missing details' });
        }

        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = await MasterProduct.findByPk(item.prd_id);
            if (!product || product.qty < item.qty) {
                return res.status(400).json({ success: false, message: `Stock error for ${item.prd_id}` });
            }
            totalAmount += (item.qty * (item.unit_price || product.unit_cost));
            validatedItems.push({ product, qty: item.qty, unit_price: item.unit_price || product.unit_cost, customOptions: item.customOptions });
        }

        // 1. SAVE FOR CUSTOMER APP (tbl_order)
        const order_id = generateOrderId();
        await Order.create({
            order_id, email, fullname, adress, postalcode,
            customer_id: customer ? customer.customer_id : null,
            amount: totalAmount, status_payment: status_payment || 'ABA',
            created_by: customer ? customer.customer_id : 'guest',
            created_on: new Date()
        });

        // 2. SAVE TO KITCHEN DISPLAY (tbl_sale)
        const sale_id = `ONL_${Date.now()}`;
        await Sale.create({
            sale_id,
            invoice_id: order_id, 
            sale_date: new Date(),
            amount: totalAmount,
            sub_total: totalAmount,
            tax: 0,
            pay_method: status_payment || 'Online',
            order_type: 'Online', 
            table_id: 'App Order',
            is_rush: false,
            status: 'Pending',
            create_by: fullname,
            created_on: new Date()
        });

        // 3. SAVE ITEMS, DEDUCT STOCK, AND ADD LOYALTY POINTS
        let pointsEarned = 0;

        for (let i = 0; i < validatedItems.length; i++) {
            const item = validatedItems[i];
            
            // Save for customer history
            await OrderItem.create({ order_id, prd_id: item.product.prd_id, unit_price: item.unit_price, qty: item.qty });

            // Save to kitchen screen items
            await SaleItemDetail.create({
                std_id: `onl_std${Date.now()}_${i}`,
                sale_id: sale_id,
                prd_id: item.product.prd_id,
                qty: item.qty,
                price: item.unit_price,
                size: item.customOptions?.size || 'M', 
                sugar: item.customOptions?.sugar || '100%', 
                ice: item.customOptions?.ice || 'Normal',
                topping: item.customOptions?.topping || 'None'
            });

            // Deduct Stock
            item.product.qty = item.product.qty - item.qty;
            await item.product.save();

            // Calculate Points (10 points per drink)
            pointsEarned += (10 * item.qty);
        }

        // 🏆 Reward the Customer with Points!
        if (customer && customer.customer_id) {
            const dbCustomer = await Customer.findByPk(customer.customer_id);
            if (dbCustomer) {
                dbCustomer.points = (dbCustomer.points || 0) + pointsEarned;
                await dbCustomer.save();
            }
        }

        res.status(201).json({
            success: true, 
            message: `Order sent to kitchen! You earned ${pointsEarned} points!`,
            data: { order_id, amount: totalAmount, pointsEarned }
        });

    } catch (error) {
        logError("customerOrderController - placeOrder", error, res);
        res.status(500).json({ success: false, message: "Checkout failed!" });
    }
};

// Get all orders for a customer
const getOrders = async (req, res) => {
    try {
        const customer = getCustomerFromToken(req);
        if (!customer) return res.status(401).json({ success: false, message: 'Please login' });

        const orders = await Order.findAll({
            where: { customer_id: customer.customer_id },
            include: [{
                model: OrderItem,
                include: [{ model: MasterProduct, attributes: ['prd_id', 'prd_name', 'photo'] }]
            }],
            order: [['created_on', 'DESC']]
        });

        res.json({ success: true, data: orders, count: orders.length });
    } catch (error) { logError("customerOrderController - getOrders", error, res); }
};

// Get specific order detail
const getOrderDetail = async (req, res) => {
    try {
        const { order_id } = req.params;
        const customer = getCustomerFromToken(req);

        const order = await Order.findOne({
            where: { order_id },
            include: [{
                model: OrderItem,
                include: [{ model: MasterProduct, attributes: ['prd_id', 'prd_name', 'photo', 'category_id', 'brand_id'] }]
            }]
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (customer && order.customer_id && order.customer_id !== customer.customer_id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, data: order });
    } catch (error) { logError("customerOrderController - getOrderDetail", error, res); }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { order_id } = req.params;
        const customer = getCustomerFromToken(req);

        if (!customer) return res.status(401).json({ success: false, message: 'Please login' });

        const order = await Order.findOne({
            where: { order_id, customer_id: customer.customer_id },
            include: [{ model: OrderItem }]
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Restore product stock
        for (const item of order.tbl_order_items) {
            const product = await MasterProduct.findByPk(item.prd_id);
            if (product) {
                product.qty = product.qty + item.qty;
                await product.save();
            }
        }

        await OrderItem.destroy({ where: { order_id } });
        await order.destroy();

        res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (error) { logError("customerOrderController - cancelOrder", error, res); }
};

// Get order by email (for guest checkout tracking)
const getOrderByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const orders = await Order.findAll({
            where: { email },
            include: [{
                model: OrderItem,
                include: [{ model: MasterProduct, attributes: ['prd_id', 'prd_name', 'photo'] }]
            }],
            order: [['created_on', 'DESC']]
        });

        res.json({ success: true, data: orders, count: orders.length });
    } catch (error) { logError("customerOrderController - getOrderByEmail", error, res); }
};

module.exports = {
    placeOrder,
    getOrders,
    getOrderDetail,
    cancelOrder,
    getOrderByEmail
};