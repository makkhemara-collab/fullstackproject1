export const printReceipt = (orderData) => {
  const { invoice_id, sale_date, items, total, pay_method, order_type, customer_name = "Walk-in Customer" } = orderData;

  const printWindow = window.open('', '_blank');
  
  const itemsHtml = items.map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <div style="flex: 1;">
        <div style="font-weight: bold;">${item.qty}x ${item.prd_name}</div>
        <div style="font-size: 10px; color: #555;">
          ${item.customOptions ? `${item.customOptions.size} | Sugar: ${item.customOptions.sugar} | Ice: ${item.customOptions.ice}` : ''}
        </div>
      </div>
      <div style="text-align: right;">$${(item.finalPrice * item.qty).toFixed(2)}</div>
    </div>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt - ${invoice_id}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0 auto; padding: 10px; color: #000; }
          .text-center { text-align: center; }
          .header { margin-bottom: 20px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 10px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="header text-center">
          <h2 style="margin: 0;">KMR CAFÉ</h2>
          <p style="font-size: 12px; margin: 5px 0;">Phnom Penh, Cambodia<br>Tel: 096 80 77 189</p>
        </div>
        
        <div style="font-size: 12px;">
          <div>Inv: ${invoice_id}</div>
          <div>Date: ${new Date().toLocaleString()}</div>
          <div>Type: ${order_type}</div>
          <div>Cust: ${customer_name}</div>
        </div>

        <div class="divider"></div>
        <div style="font-size: 13px;">${itemsHtml}</div>
        <div class="divider"></div>

        <div class="total-row">
          <span>TOTAL</span>
          <span>$${total.toFixed(2)}</span>
        </div>
        
        <div style="font-size: 12px; margin-top: 10px;">
          Method: ${pay_method}<br>
          Status: PAID
        </div>

        <div class="divider"></div>
        <p class="text-center" style="font-size: 12px;">Thank you! Enjoy your coffee!</p>
      </body>
    </html>
  `);
  printWindow.document.close();
};