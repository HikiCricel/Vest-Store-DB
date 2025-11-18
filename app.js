// Загрузка и создание объекта express
const express = require("express");
const app = express();
const urlencodedParser = express.urlencoded({ extended: false });

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
        // Основа SQL-запроса для таблицы armor_products
        const classId = req.query.classId;
        const materialId = req.query.materialId;
        const sizeId = req.query.sizeId;
        const companyId = req.query.companyId;

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
    if (!req.body) return res.sendStatus(400);

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
    if (!req.body) return res.sendStatus(400);

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


app.listen(3000, function () {
    console.log("Server is ready to Connect...");
});

