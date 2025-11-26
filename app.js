const express = require("express");
const app = express();
const urlencodedParser = express.urlencoded({ extended: false });

app.set("view engine", "hbs");

require('dotenv').config();
const hbs = require('hbs');

const homeRouter = require("./Routes/homeRouter.js");
const vestRouter = require("./Routes/vestRouter.js");
const clientRouter = require("./Routes/clientRouter.js");
const salesRouter = require("./Routes/salesRouter.js");

app.use("/list", urlencodedParser, vestRouter);
app.use("/clients", urlencodedParser, clientRouter);
app.use("/sales", urlencodedParser, salesRouter);
app.use("/", urlencodedParser, homeRouter);

app.use(function (req, res, next) {
    res.status(404).send("Not Found")
});

console.log("Server is ready to Connect...!")
app.listen(3000);