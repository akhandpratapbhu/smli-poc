export const generatePrintHTML = (rowData: any): string => {
  const dynamicData = rowData.dynamicItemDetail?.[0] || {};
  const gridItems = rowData.gridsData?.[0]?.gridItems || [];
console.log("dynamicData",dynamicData,"gridItems",gridItems);
const subtotal = gridItems.reduce((sum: number, item: { quantity: number; unitprice: number; }) => {
  const quantity = item.quantity || 0;
  const unitprice = item.unitprice || 0;
  return sum + (quantity * unitprice);
}, 0);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Order Receipt</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          margin: 0;
          padding: 20px;
          background: #f7f7f7;
          color: #333;
        }
        .receipt {
          max-width: 1024px;
          margin: auto;
          background: #fff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #ea122d;
        }
        .order-info {
          text-align: right;
          font-size: 14px;
        }
        .section {
          margin-top: 30px;
        }
        .section h2 {
          font-size: 16px;
          color: #555;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .details {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        .details div {
          width: 48%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 14px;
        }
        th, td {
          text-align: left;
          padding: 10px;
          border: 1px solid #e1e1e1;
        }
        th {
          background-color: #ea122d;
          color: #fff;
        }
        .totals {
          margin-top: 20px;
          float: right;
          width: 40%;
        }
        .totals td {
          padding: 8px;
        }
        .totals td.label {
          text-align: right;
          font-weight: bold;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
        @media print {
          .print-btn { display: none; }
          body {
            background: #fff;
            padding: 0;
          }
          .receipt {
            box-shadow: none;
            margin: 0;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="logo">SML</div>
          <div class="order-info">
            <strong>Order #</strong> ${dynamicData.ID || "N/A"}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString()}
          </div>
        </div>

        <div class="section">
          <h2>Billing & Shipping</h2>
          <div class="details">
            <div>
              <strong>Billed To:</strong><br>
              PI Number: ${dynamicData.pinumber || "N/A"}<br>
              customername: ${dynamicData.customername || "N/A"}<br>
              Customer Type: ${dynamicData.customerType || "N/A"}
            </div>
            <div>
              <strong>Shipped To:</strong><br>
              Invoice No: ${dynamicData.invoiceno || "N/A"}<br>
              Address: ${dynamicData.address || "N/A"}<br>
              Invoice Date: ${dynamicData.invoicedate || "N/A"}
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Order Items</h2>
          <table>
            <thead>
              <tr>
                <th>Part No</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${gridItems.map((item: { partno: any; partdescription: any; quantity: any; unitprice: number; }) => `
                <tr>
                  <td>${item.partno || "N/A"}</td>
                  <td>${item.partdescription || "N/A"}</td>
                  <td>${item.quantity || 0}</td>
                  <td>$${item.unitprice || "0.00"}</td>
                  <td>$${((item.quantity || 0) * (item.unitprice || 0))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <table class="totals">
          <tr><td class="label">Subtotal:</td><td>$${subtotal || "0.00"}</td></tr>
          <tr><td class="label">Shipping:</td><td>$${rowData.shipping|| "0.00"}</td></tr>
          <tr><td class="label">Tax:</td><td>$${rowData.tax || "0.00"}</td></tr>
          <tr><td class="label"><strong>Total:</strong></td><td><strong>$${subtotal || "0.00"}</strong></td></tr>
        </table>

        <div style="clear: both;"></div>
        <div class="footer">
      
        </div>
      </div>
    </body>
    </html>
  `;
};
