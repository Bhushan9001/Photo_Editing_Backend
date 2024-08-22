const express = require('express');
const passport = require('passport');

const userRoutes = require('./src/routes/client/userRoutes')
const adminRoutes = require('./src/routes/admin/adminRoutes')
const serviceRoutes = require('./src/routes/service/serviceRoutes');
const subServiceRoutes = require('./src/routes/service/subServicesRoutes');
const priceRoutes = require('./src/routes/service/priceRoutes');

const app = express();

app.use(express.json());
app.use(passport.initialize());
require('./src/passport');

app.use("/api/users",userRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/services",serviceRoutes);
app.use("/api/subServices",subServiceRoutes);
app.use("/api/prices",priceRoutes);

app.get("/",(req,res)=>{
    res.send("<h1>i am inevitable!!</h1>")
})

app.listen(8080,()=>{
    console.log("[Server]:-http://localhost:8080")
})