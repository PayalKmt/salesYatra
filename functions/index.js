const functions = require("firebase-functions");
// const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const userRoutes = require("./src/routes/userRoute");
const storeRoutes = require("./src/routes/storeRoute");
const warehouseRoutes = require("./src/routes/warehouseWeb/warehouseRoute");
const warehouseProductRoutes = require("./src/routes/warehouseWeb/productsRoute");
const warehouseUsersRoutes = require("./src/routes/warehouseWeb/warehouseUsersRoute");
const orderRoutes = require("./src/routes/warehouseWeb/orderRoute");

app.use(cors({ origin: true }));
app.use(bodyParser.json());

app.use("/api", userRoutes);
app.use("/api", storeRoutes);
app.use("/api", warehouseRoutes);
app.use("/api", warehouseProductRoutes);
app.use("/api", warehouseUsersRoutes);
app.use("/api", orderRoutes);

// const port = 3000;
// app.listen(port,()=>{
//     console.log("App is listening at port 3000")
// });
app.listen();

// app.get('/',(req,res)=>{
//     return res.status(200).send("Hello world")
// })

exports.app = functions.https.onRequest(app);
