const { Sale, SaleItemDetail, MasterProduct } = require('../models');
const logError = require('../utils/logger');
const { alertNewSale } = require('../utils/sendtelegram');

const saleItem = async (req, res) => {
    try {
        const {
            invoice_id, sale_date, amount, sub_total, tax, 
            pay_method, create_by, created_on, order_type, table_id 
        } = req.body;
        
        const sale_id = `sale_${Date.now()}`; 
        const now = new Date();
        
        // 1. Create Sale (With Fallbacks to prevent Database crashes!)
        const sale = await Sale.create({
            sale_id,
            invoice_id,
            sale_date: sale_date || now,         // 👈 Fallback added
            amount,
            sub_total: sub_total || amount,      // 👈 Fallback added
            tax: tax || 0,
            discount: req.body.discount || 0,
            pay_method: pay_method || 'CASH',
            create_by: create_by || 'Unknown',   // 👈 Fallback added
            created_on: created_on || now,       // 👈 Fallback added
            order_type: order_type || 'Dine-in',
            table_id: table_id || null,
            is_rush: req.body.is_rush || false,
            status: 'Pending' 
        });

        // 2. Create Sale Details & Update Stock
        var ListItemSale = req.body.saleItems || req.body.items; 
        for (let i = 0; i < ListItemSale.length; i++) {
            const item = ListItemSale[i];
            const std_id = `std${Date.now()}_${i}`; 
            
            await SaleItemDetail.create({
                std_id: std_id,
                sale_id: sale_id, 
                prd_id: item.prd_id,
                qty: item.qty,
                price: item.price || item.finalPrice,
                size: item.customOptions?.size || item.size || 'M',
                sugar: item.customOptions?.sugar || item.sugar || '100%',
                ice: item.customOptions?.ice || item.ice || 'Normal',
                topping: item.customOptions?.topping || item.topping || 'None'
            });

            // Update stock quantity
            var product = await MasterProduct.findByPk(item.prd_id);
            if (product) {
                product.qty = product.qty - item.qty; 
                await product.save(); 
            }

            // Send to telegram
            alertNewSale(sale);
        }

        res.status(200).json({
            success: true,
            message: 'Sale created successfully',
        });

    }
    catch (error) {
        console.log("================ START ERROR ===============");
        console.log("MESSAGE:", error.message);
        if (error.errors) {
            console.log("SEQUELIZE ERRORS:", error.errors.map(e => e.message));
        }
        if (error.original) {
            console.log("SQL ERROR:", error.original.sqlMessage);
        }
        console.log("================ END ERROR =================");
        
        const errorMsg = error.errors ? error.errors.map(e => e.message).join(', ') : (error.message || 'Unknown error');
        logError("posSaleController", { message: errorMsg }, res);
        
        // 👈 Added this so the frontend doesn't freeze on an error!
        res.status(500).json({
            success: false,
            message: "Failed to process sale: " + errorMsg
        });
    }
}

const getSale = async (req, res) => {
    try {
        const sales = await Sale.findAll({
            include: [{
                model: SaleItemDetail,
                include: [{
                    model: MasterProduct,
                    attributes: ['prd_name']
                }]
            }],
            order: [['created_on', 'DESC']]
        });

        // Format it so the React Kitchen Display can read it easily
        const formattedSales = sales.map(sale => {
            const plainSale = sale.get({ plain: true });
            plainSale.saleItems = plainSale.tbl_sale_item_details.map(detail => ({
                ...detail,
                prd_name: detail.tbl_master_product ? detail.tbl_master_product.prd_name : 'Unknown Product'
            }));
            return plainSale;
        });

        res.json({ success: true, data: formattedSales });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add this new function at the bottom
const updateSaleStatus = async (req, res) => {
    try {
        const { sale_id } = req.params;
        const { status } = req.body;

        const sale = await Sale.findByPk(sale_id);
        if (!sale) {
            return res.status(404).json({ success: false, message: "Sale not found" });
        }

        sale.status = status; // e.g., 'Completed'
        await sale.save();

        res.json({ success: true, message: "Status updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    saleItem,
    getSale,
    updateSaleStatus 
};
