const express = require("express");
const salesController = require("../Controllers/salesController.js");

const salesRouter = express.Router();

salesRouter.use("/addToCart/:id", salesController.addToCart);
salesRouter.use("/getCart", salesController.getCart);

salesRouter.use("/cartToHistory", salesController.cartToHistory);
salesRouter.use("/getHistory/:id", salesController.getHistory);

module.exports = salesRouter;