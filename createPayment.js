const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // Important for frontend requests

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/createPayment', async (req, res) => {

  const { amount, customerName, customerEmail, phoneNumber } = req.body;

  try {
    const response = await fetch('https://api.myfatoorah.com/v2/SendPayment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MYFATOORAH_API_KEY}`,  // <-- Replace this with your real MyFatoorah API key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        InvoiceValue: amount,
        CustomerName: customerName,
        CustomerEmail: customerEmail,
        CustomerMobile: phoneNumber,
        DisplayCurrencyIso: 'KWD',
        CallBackUrl: 'https://lockstorekw.shop/thankyou.html',
        ErrorUrl: 'https://lockstorekw.shop/error.html',
        Language: 'en',
        CustomerReference: 'Lock Order ' + Date.now(),
        NotificationOption: 'LNK', // <-- This fixed your error!
        InvoiceItems: [
          {
            ItemName: "Lock Perfume Order",
            Quantity: 1,
            UnitPrice: amount
          }
        ]
      })
    });

    const data = await response.json();

    // Log what you get from MyFatoorah
    console.log('MyFatoorah Response:', data);

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

// Home route (optional)
app.get('/', (req, res) => {
  res.send('Lock Payment Backend is Running!');
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));