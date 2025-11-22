// Загрузка и создание объекта express
const express = require("express");
const app = express();
const urlencodedParser = express.urlencoded({ extended: false });

let cart = [];

// Загрузка пакета для работы с сервером PostgreSQL
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
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
        // Основа SQL-запроса для таблицы armor_products
        const classId = req.query.classId;
        const materialId = req.query.materialId;
        const sizeId = req.query.sizeId;
        const companyId = req.query.companyId;
        const cartLenght = cart.length;

        let query = `
            SELECT 
                ap.*, 
                ac.class_name AS armor_class_name, 
                m.material_name AS material_name, 
                s.size_name AS size_name, 
                mf.company_name AS manufacturer_name
            FROM armor_products ap
            LEFT JOIN armor_classes ac ON ap.armor_class_id = ac.id
            LEFT JOIN materials m ON ap.material_id = m.id
            LEFT JOIN sizes s ON ap.size_id = s.id
            LEFT JOIN manufacturers mf ON ap.manufacturer_id = mf.id
        `;
        let filters = []; // Фильтрация по полю
        let params = [];  // Параметры SQL-запроса
        let paramIndex = 1;

        //---------------------------------------------------
        if (classId && classId !== '0' && classId !== '') {   // Если запрос содержит параметра devId
            filters.push(`ap.armor_class_id = $${paramIndex}`); // Условие фильтрации
            params.push(classId);    // Параметр SQL-запроса
            paramIndex++;
        }

        if (materialId && materialId !== '0' && materialId !== '') {   // Если запрос содержит параметра devId
            filters.push(`ap.material_id = $${paramIndex}`); // Условие фильтрации
            params.push(materialId);    // Параметр SQL-запроса
            paramIndex++;
        }

        if (sizeId && sizeId !== '0' && sizeId !== '') {   // Если запрос содержит параметра devId
            filters.push(`ap.size_id = $${paramIndex}`); // Условие фильтрации
            params.push(sizeId);    // Параметр SQL-запроса
            paramIndex++;
        }

        if (companyId && companyId !== '0' && companyId !== '') {   // Если запрос содержит параметра devId
            filters.push(`ap.manufacturer_id = $${paramIndex}`); // Условие фильтрации
            params.push(companyId);    // Параметр SQL-запроса
            paramIndex++;
        }
        //---------------------------------------------------
        // Формирование параметрического SQL-запроса
        if (filters.length > 0) {
            query += " WHERE " + filters.join(" AND ");
        }

        query += " ORDER BY ap.id ASC";

        //-----------------------------------------------------------------------
        // Запрос списка товаров
        const result = await pool.query(query, params);
        const vests = result.rows;


        const classResult = await pool.query(`
            SELECT DISTINCT ac.id, ac.class_name 
            FROM armor_products ap
            JOIN armor_classes ac ON ap.armor_class_id = ac.id
            ORDER BY ac.class_name ASC
        `);

        const armor_classes = classResult.rows;

        const materialResult = await pool.query(`
            SELECT DISTINCT m.id, m.material_name 
            FROM armor_products ap
            JOIN materials m ON ap.armor_class_id = m.id
            ORDER BY m.material_name ASC
        `);
        const materials = materialResult.rows;

        const sizeResult = await pool.query(`
            SELECT DISTINCT s.id, s.size_name 
            FROM armor_products ap
            JOIN sizes s ON ap.armor_class_id = s.id
            ORDER BY s.size_name ASC
        `);
        const sizes = sizeResult.rows;

        const companyResult = await pool.query(`
            SELECT DISTINCT mf.id, mf.company_name 
            FROM armor_products ap
            JOIN manufacturers mf ON ap.armor_class_id = mf.id
            ORDER BY mf.company_name ASC
        `);
        const companies = companyResult.rows;

        res.render("Tables", {
            Vests: vests,
            Classes: armor_classes,
            Materials: materials,
            Sizes: sizes,
            Companies: companies,
            selectedClassId: classId || '0',
            selectedMaterialId: materialId || '0',
            selectedSizeId: sizeId || '0',
            selectedCompanyId: companyId || '0',
            cartLen: cartLenght
        });
    } catch (err) {
        console.error("Download Product list Error:", err)
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
        const {
            id, name, price, stock_quantity,
            armor_class_id, material_id, size_id, manufacturer_id
        } = req.body;

        await pool.query("INSERT INTO armor_products (name, price, stock_quantity, armor_class_id, material_id, size_id, manufacturer_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [name, price, stock_quantity, armor_class_id, material_id, size_id, manufacturer_id], function (err, data) {
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
            console.log("Not Found")
        }

        res.render("vestEdit", {
            list: result.rows[0]
        });
    } catch (err) {
        console.error("Render product for Update Error:", err)
    }
});

app.post("/list/postEditVest", urlencodedParser, async function (req, res) {
    try {
        const {
            id, name, price, stock_quantity,
            armor_class_id, material_id, size_id, manufacturer_id
        } = req.body;

        await pool.query("UPDATE armor_products SET name=$2, price=$3, stock_quantity=$4, armor_class_id=$5, material_id=$6, size_id=$7, manufacturer_id=$8 WHERE id=$1", [
            id, name, price, stock_quantity,
            armor_class_id, material_id, size_id, manufacturer_id
        ]);

        res.redirect("/list");
    } catch (err) {
        console.error("Update Product Error:", err);
    }
});

app.post("/list/deleteVest/:id", async function (req, res) {
    try {
        const id = req.params.id;
        pool.query("DELETE FROM armor_products WHERE id=$1", [id],
            function (err, data) {
                if (err) return console.log(err);
                res.redirect("/list");
            });
    }
    catch {
        console.log("Database Delete Error");
    }
});

app.get("/clients", async function (req, res) {
    try {
        pool.query("SELECT * FROM clients", function (err, result) {
            if (err) return console.log(err);

            const clients = result.rows;

            // Передача данных на представление
            res.render("clients", {
                Clients: clients
            });
        });
    }
    catch (err) {
        console.error("Download Client list Error:", err)
    }
});

app.get("/clients/addClient", async function (req, res) {
    try {
        res.render("addClient");
    }
    catch (err) {
        console.log("Client Create Error")
    }
});

app.post("/clients/postAddClient", urlencodedParser, async function (req, res) {
    try {
        const {
            client_name, birth_year, address,
            phone
        } = req.body;


        await pool.query("INSERT INTO clients (client_name, birth_year, address, phone) VALUES ($1, $2, $3, $4)",
            [client_name, birth_year, address,
                phone], function (err, data) {
                    res.redirect("/clients");
                });
    }
    catch (err) {
        console.log("Client Post Error")
    }
});

app.get("/clients/editClient/:id", async function (req, res) {
    try {
        const id = req.params.id;
        const result = await pool.query(
            "SELECT * FROM clients WHERE id=$1",
            [id]
        );

        if (result.rows.length === 0) {
            console.log("Not Found")
        }

        res.render("clientEdit", {
            clients: result.rows[0]
        });
    } catch (err) {
        console.error("Render product for Update Error:", err)
    }
});

app.post("/clients/postEditClient", urlencodedParser, async function (req, res) {
    if (!req.body) return res.sendStatus(400);

    try {
        const {
            id, client_name, birth_year, address,
            phone
        } = req.body;

        await pool.query("UPDATE clients SET client_name=$2, birth_year=$3, address=$4, phone=$5 WHERE id=$1", [
            id, client_name, birth_year, address,
            phone
        ]);

        res.redirect("/clients");
    } catch (err) {
        console.error("Update Product Error:", err);
    }
});

app.get("/sales/addToCart/:id", urlencodedParser, async function (req, res) {
    try {
        const id = req.params.id;
        // Выбор товара из базы данных
        await pool.query("SELECT * FROM armor_products WHERE id=$1", [id], function (err, result) {

            const vest = result.rows[0];
            // Добавление товара в массив cart[]
            cart.push(vest);

            // Переход на страницу просмотра списка товаров
            res.redirect("/list");
        });
    }
    catch (err) {
        console.error("Add to Cart Error:", err);
    }
});

app.get("/sales/getCart", async function (req, res) {
    try {
        // Вычисление стоимости товаров в Корзине
        const totalPrice = cart.reduce((total, vest) => {
            // Очищаем строку от лишних символов и преобразуем в число
            const priceStr = String(vest.price).replace(/[^\d.,-]/g, '');
            const priceNum = parseFloat(priceStr.replace(',', '.'));

            return total + (isNaN(priceNum) ? 0 : priceNum);
        }, 0);

        const clientResult = await pool.query("SELECT id, client_name FROM clients ORDER BY client_name ASC");
        const clients = clientResult.rows;

        res.render("Cart", {
            cartVest: cart,
            totalPrice: totalPrice.toFixed(2),
            Clients: clients
        });
    }
    catch (err) {
        console.log("Get Cart Error");
    }
});

app.post("/sales/cartToHistory", urlencodedParser, async function (req, res) {
    try{
        const clientId = req.body.client_id;
        const vastid = req.body.armor_product_id;
        // cart.forEach(vest => {
        //     pool.query("INSERT INTO history (armor_product_id, client_id, sell_date) VALUES ($1, $2, NOW()::timestamp without time zone)",
        //         [vest.id, clientId], async function (err) {
        //             if (err) console.log(err);
        //         });
        // });
        const insertPromises = cart.map(vest => {
            return pool.query(
                "INSERT INTO history (armor_product_id, client_id, sell_date) VALUES ($1, $2, NOW()::timestamp without time zone)",
                [vastid, clientId]
            );
        });

        await Promise.all(insertPromises);
    
        // Очищаем корзину после оформления заказа
        cart = [];
    
        res.redirect("/list");
    }
    catch(err){
        console.log("Post Cart History Error");
    }
});

app.get("/clients/getHistory/:client_id", async function (req, res) {
    try{
        const clientId = req.params.client_id;
    
        // Отбор покупок клиента из таблицы History
        await pool.query("SELECT * FROM history WHERE client_id=$1", [clientId],
            function (err, result) {
                if (err) return console.log(err);
                const history = result.rows;
    
                res.render("history", {
                    History: history
                });
            });
    }
    catch(err){
        console.log("Get Cart History Error");
    }
});

app.listen(3000, function () {
    console.log("Server is ready to Connect...");
});

