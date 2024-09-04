const express = require('express');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // Add this line
require('./src/passport');

const userRoutes = require('./src/routes/client/userRoutes')
const adminRoutes = require('./src/routes/admin/adminRoutes')
const serviceRoutes = require('./src/routes/service/serviceRoutes');
const subServiceRoutes = require('./src/routes/service/subServicesRoutes');
const priceRoutes = require('./src/routes/service/priceRoutes');
const utilitis = require("./utilitis/dropbox");
const jobRoutes = require('./src/routes/service/jobRoutes');
const paymentRoutes = require('./src/routes/service/paymentRoutes');
const imageRoutes = require('./src/routes/service/imageRoutes');
const dropboxRouter = require('./utilitis/dropbox')
const app = express();

// Add this block before other middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com", "https://embed.tawk.to", "'unsafe-inline'"],
        frameSrc: ["'self'", "https://api.razorpay.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.razorpay.com", "wss://"],
        styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrcElem: ["'self'", "https://checkout.razorpay.com", "https://embed.tawk.to", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false, // This might be needed for some third-party integrations
  })
);

app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use("/api/users",userRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/services",serviceRoutes);
app.use("/api/subServices",subServiceRoutes);
app.use("/api/prices",priceRoutes);
app.use("/api",utilitis);
app.use('/api/jobs', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api',imageRoutes)
app.use('/api', dropboxRouter); 

app.use(express.static(path.join(__dirname, 'build')));

app.get('', (req, res) => {
  res.sendFile(path.join(__dirname+'/build/index.html'));
});

app.listen(8080,'0.0.0.0',()=>{
  console.log("[Server]:-http://15.206.148.121:8080")
});