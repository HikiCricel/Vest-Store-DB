const connectController = require("../Controllers/connectController.js");

const pool = connectController.pool;

exports.getClients = async function (req, res) {
    try {
        pool.query("SELECT * FROM clients ORDER BY id", function (err, result) {
            if (err) return console.log(err);

            const clients = result.rows;

            // Передача данных на представление
            res.render("../Views/Clients/Clients", {
                Clients: clients
            });
        });
    }
    catch (err) {
        console.error("Download Client list Error:", err)
    }
}

exports.addClient = async function (req, res) {
    try {
        res.render("../Views/Clients/addClient");
    }
    catch (err) {
        console.log("Client Create Error")
    }
}

exports.postAddClient = async function (req, res) {
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
}

exports.editClient = async function (req, res) {
    try {
        const id = req.params.id;
        const result = await pool.query(
            "SELECT * FROM clients WHERE id=$1",
            [id]
        );

        if (result.rows.length === 0) {
            console.log("Not Found")
        }

        res.render("../Views/Clients/clientEdit", {
            clients: result.rows[0]
        });
    } catch (err) {
        console.error("Render product for Update Error:", err)
    }
}

exports.postEditClient = async function (req, res) {
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
}