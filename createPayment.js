const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
const cors = require('cors');

app.post('/createPayment', async (req, res) => {

    const { amount, customerName, customerEmail, phoneNumber } = req.body;
  
    try {
      const response = await fetch('https://api.myfatoorah.com/v2/SendPayment', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 8givlrF-OGQNWhJC8V0RQS9Klzbk4MGj6kZwCZwxu43-t6YqReg3OASF-_VggYDFtboZCGjrnGcplNyJpn9DErYv_fPGBpDFko-F7JkRcR0n_bfioy7MjAtxTwdAMv8hGR04XDpkn-lwxOG_IrnGF2P4PiIuiZstv-qE-AuOadLKCTmWXZ6Xsezj7DMIF3NCU6bkvXWO5JE7Jla_nGgmGA4_8KlkHekq1akxeGfKOENz3g0WlxgnscStWL5vCY2CB3v8T-QBUCkEa7xFRbaln8Bsp4Z4nOP0mkv_Kof6vQkmTR92SjC0q0oI-01EUezHN9L6HzCd3mYF2nqR2jKFHgUM5wiE9bHOyhYIickULHB4L1HhvJ9ueBoz9jR7DOsLgUNXIwwPt7-LEwV3AC4Hd8SfOuSmkYlOHca0qqJpPyLUa6pe1YHGsf8HoIL81e0atVvIAQXPePMdPfZPTQRdp8heC9-9rF0zTSmD5qeBCbI0v6LrfMVTvK9cTGGruil4oksVSTlgS79YjIJ9JVuCIXSXxrwL8ZonN5Yw3UmiSmvA1-ViOnk8JYsFs3Ucna86nq5MFLNK-_dFyiVycBG8xqCtE3lXAQ0ESIttT6G6FHVEcHQ8uVf7dbbGVIPfmzLE8FgXdYAvwuArzwz9jtDrkt2onT9MtsJmV3_1OAaeX3kVAp4e', // Put your live/test key here
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