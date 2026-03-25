/**
 * Service to generate and download payment receipts
 */

export const generateReceipt = (paymentData) => {
    const {
        paymentId,
        orderId,
        amount,
        currency,
        planName,
        userName,
        userEmail,
        date = new Date().toLocaleDateString(),
    } = paymentData;

    const symbol = currency === 'INR' ? '₹' : '$';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Receipt - ${paymentId}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
                .receipt-box { max-width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); padding: 30px; border-radius: 10px; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #1e40af; }
                .receipt-title { font-size: 24px; color: #64748b; }
                .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                .meta-item h4 { margin: 0 0 5px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; }
                .meta-item p { margin: 0; font-weight: 600; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; }
                td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
                .footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #dcfce7; color: #166534; }
                .total-row { font-size: 18px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="receipt-box">
                <div class="header">
                    <div class="logo">LocatorX</div>
                    <div class="receipt-title">RECEIPT</div>
                </div>

                <div class="meta">
                    <div class="meta-item">
                        <h4>Billed To</h4>
                        <p>${userName || 'Valued Customer'}</p>
                        <p>${userEmail || ''}</p>
                    </div>
                    <div class="meta-item" style="text-align: right;">
                        <h4>Payment Details</h4>
                        <p>ID: ${paymentId}</p>
                        <p>Date: ${date}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>${planName} Subscription</strong><br>
                                <span style="font-size: 12px; color: #64748b;">Unlimited workspaces and priority support for 30 days.</span>
                            </td>
                            <td style="text-align: right;">${symbol}${amount.toLocaleString()}</td>
                        </tr>
                        <tr class="total-row">
                            <td style="text-align: right;">Total Paid</td>
                            <td style="text-align: right; color: #1e40af;">${symbol}${amount.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="text-align: center; margin-bottom: 30px;">
                    <span class="badge">Payment Captured Successfully</span>
                </div>

                <div class="footer">
                    <p>Thank you for choosing LocatorX!</p>
                    <p>If you have any questions, please contact support@locatorx.com</p>
                    <p>&copy; 2024 LocatorX Inc.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Create a blob and download it
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LocatorX-Receipt-${paymentId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
