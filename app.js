// Загрузка и создание объекта express
const express = require("express");
const app = express();
const urlencodedParser = express.urlencoded({ extended: false });

// Загрузка пакета для работы с сервером PostgreSQL
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database', err.stack);
    } else {
        console.log('Connected to the database:', res.rows);
    }
});

// Использование представления hbs
app.set("view engine", "hbs");
app.set("views", "./views");

//====================================================
// Область кода приложения 
//====================================================
app.get("/", function (req, res) {
    res.render("Index");
});

app.get("/about", function (req, res) {
    res.render("About");
});

// Получение списка товаров
app.get("/list", async function (req, res) {
    try {
        const result = await pool.query(`
            SELECT * FROM public.armor_products 
            ORDER BY id ASC
        `);

        const vests = result.rows;
        res.render("Tables", { Vests: vests });
    } catch (err) {
        console.error("Ошибка при загрузке списка товаров:", err);
        res.status(500).send("Ошибка сервера");
    }
});


app.get("/list/addVest", async function (req, res) {
    try {
        res.render("addVest");
    }
    catch (err) {
        console.log("Database Create error")
    }

});

app.post("/list/postAddVest", urlencodedParser, async function (req, res) {

    try {
        if (!req.body) return res.sendStatus(400);

        const VestId = req.body.id;
        const name = req.body.name;
        const Price = req.body.price;
        const stock_quantity = req.body.stock_quantity;
        const armor_class_id = req.body.armor_class_id;
        const material_id = req.body.material_id;
        const size_id = req.body.size_id;
        const manufacturer_id = req.body.manufacturer_id;

        const result = await pool.query("INSERT INTO armor_products (id, name, price, stock_quantity, armor_class_id, material_id, size_id, manufacturer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [VestId, name, Price, stock_quantity, armor_class_id, material_id, size_id, manufacturer_id], function (err, data) {
                res.redirect("/list");
            });
    }
    catch (err) {
        console.log("DataBase Post Error")
    }
});

app.get("/list/editVest/:id", async function (req, res) {
    try {
        const id = req.params.id;
        const result = await pool.query(
            "SELECT * FROM armor_products WHERE id=$1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Product not found");
        }

        res.render("vestEdit", {
            list: result.rows[0]
        });
    } catch (err) {
        console.error("Render product for Update Error:", err);
        res.status(500).send("Service Error");
    }
});

app.post("/list/postEditVest", urlencodedParser, function (req, res) {

    if (!req.body) return res.sendStatus(400);

    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const stock_quantity = req.body.stock_quantity;
    const armor_class_id = req.body.armor_class_id;
    const material_id = req.body.material_id;
    const size_id = req.body.size_id;
    const manufacturer_id = req.body.manufacturer_id;

    pool.query("UPDATE armor_products SET name=$2, price=$3, stock_quantity=$4, armor_class_id=$5, material_id=$6, size_id=$7, manufacturer_id=$8 WHERE id=$1",
        [id, name, price, stock_quantity, armor_class_id, material_id, size_id, manufacturer_id], function (err, data) {
            if (err) return console.log(err);

            res.redirect("/list");
        });
});

app.post("/list/deleteVest/:id", async function (req, res) {
    const id = req.params.id;
    pool.query("DELETE FROM armor_products WHERE id=$1", [id],
        function (err, data) {
            if (err) return console.log(err);
            res.redirect("/list");
        });
});


app.listen(3000, function () {
    console.log("Server is ready to Connect...");
});

