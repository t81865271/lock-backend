const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Route: Create Payment
app.post('/createPayment', async (req, res) => {
  const { amount, customerName, customerEmail, phoneNumber, formData } = req.body;

  try {
    // 1. Store UNPAID order in Google Sheets
    const userID = 'USER-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);

    const sheetBody = {
      UserID: userID,
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      PhoneNumber: phoneNumber,
      Email: customerEmail,
      Area: formData.Area,
      Block: formData.Block,
      Street: formData.Street,
      House: formData.House,
      Building: formData.Building,
      Floor: formData.Floor,
      Apartment: formData.Apartment,
      Status: 'UNPAID'
    };

    await fetch('https://script.google.com/macros/s/AKfycbykL9HKeWGJLJes3692Dq-yOltiMa0EiC2tEbbIljvW4omVYbjY6TmFvZc_26br7mjD/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetBody)
    });

    // 2. Generate MyFatoorah Payment
    const response = await fetch('https://api.myfatoorah.com/v2/SendPayment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MYFATOORAH_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        InvoiceValue: amount,
        CustomerName: customerName,
        CustomerEmail: customerEmail,
        CustomerMobile: phoneNumber,
        DisplayCurrencyIso: 'KWD',
        CallBackUrl: 'https://lockstorekw.shop/thankyou.html?token=fddafb@!192837465',
        ErrorUrl: 'https://lockstorekw.shop/error.html',
        Language: 'en',
        CustomerReference: userID,
        InvoiceDisplayValue: 'Lock Perfumes',
        InvoiceItems: [
          {
            ItemName: "Lock Perfumes Order",
            Quantity: 1,
            UnitPrice: amount
          }
        ],
        NotificationOption: 'Lnk'
      })
    });

    const data = await response.json();

    if (!data.IsSuccess) {
      console.error('MyFatoorah Error:', data);
      return res.status(400).json({ message: 'MyFatoorah Payment failed', details: data });
    }

    res.json({ paymentLink: data.Data.InvoiceURL });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Home Route
app.get('/', (req, res) => {
  res.send('Lock Payment Backend is Running!');
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));