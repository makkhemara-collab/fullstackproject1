const { Table } = require('../models');

const TableRoute = (app) => {
    // Get all tables
    app.get('/api/tables', async (req, res) => {
        try {
            // If table is empty, create defaults automatically
            let tables = await Table.findAll();
            if (tables.length === 0) {
                await Table.bulkCreate([
                    { name: 'T-01' }, { name: 'T-02' }, { name: 'T-03' },
                    { name: 'Window-1' }, { name: 'Window-2' }, { name: 'Sofa-1' }
                ]);
                tables = await Table.findAll();
            }
            res.json({ success: true, data: tables });
        } catch (error) { res.status(500).json({ success: false }); }
    });

    // Update table status
    app.put('/api/tables/:id', async (req, res) => {
        try {
            await Table.update({ status: req.body.status }, { where: { id: req.params.id }});
            res.json({ success: true });
        } catch (error) { res.status(500).json({ success: false }); }
    });
};
module.exports = TableRoute;