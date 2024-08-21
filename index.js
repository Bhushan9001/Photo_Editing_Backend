const express = require('express');
const passport = require('passport');

const userRoutes = require('./src/routes/client/userRoutes')
const adminRoutes = require('./src/routes/admin/adminRoutes')

require('./src/passport');

const app = express();


app.use(express.json());
app.use(passport.initialize());

app.use("/api/users",userRoutes);
app.use("/api/admin",adminRoutes);


app.get("/",(req,res)=>{
    res.send("<h1>i am inevitable!!</h1>")
})

app.listen(8080,()=>{
    console.log("[Server]:-http://localhost:8080")
})