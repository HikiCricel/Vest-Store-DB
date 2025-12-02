const connectController = require("../Controllers/connectController.js");

const pool = connectController.pool;
let cart = connectController.cart;

exports.addToCart = async function (req, res) {
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
}

exports.getCart = async function (req, res) {
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

        res.render("../Views/Sales/Cart", {
            cartVest: cart,
            totalPrice: totalPrice.toFixed(2),
            Clients: clients
        });
    }
    catch (err) {
        console.log("Get Cart Error");
    }
}

exports.cartToHistory = async function (req, res) {
    try {
        const clientId = req.body.client_id;
        // const vestid = req.body.armor_product_id;

        const insertPromises = cart.map(vest => {
            const vestid = vest.id;
            return pool.query(
                "INSERT INTO history (armor_product_id, client_id, sell_date) VALUES ($1, $2, NOW()::timestamp without time zone)",
                [vestid, clientId]
            );
        });

        await Promise.all(insertPromises);

        // Очищаем корзину после оформления заказа
        cart.length = 0;

        res.redirect("/list");
    }
    catch (err) {
        console.log("Post Cart History Error");
    }
}

exports.getHistory = async function (req, res) {
    try {
        const clientId = req.params.id;

        // Отбор покупок клиента из таблицы History
        await pool.query("SELECT * FROM history WHERE client_id=$1", [clientId],
            function (err, result) {
                if (err) return console.log(err);
                const history = result.rows;

                res.render("../Views/Sales/History", {
                    History: history
                });
            });
    }
    catch (err) {
        console.log("Get Cart History Error");
    }
}