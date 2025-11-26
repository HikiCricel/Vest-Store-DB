const express = require("express");
const vestController = require("../Controllers/vestController.js");

const vestRouter = express.Router();

vestRouter.use("/addVest", vestController.addVest);
vestRouter.use("/postAddVest", vestController.postAddVest);

vestRouter.use("/editVest/:id", vestController.editVest);
vestRouter.use("/postEditVest", vestController.postEditVest);

vestRouter.use("/deleteVest/:id", vestController.deleteVest);

vestRouter.use("/", vestController.getVests);

module.exports = vestRouter;