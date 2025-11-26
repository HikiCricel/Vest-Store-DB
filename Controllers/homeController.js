exports.index = async function (reeq, res) {
    res.render("../Views/Home/Index");
}

exports.about = async function (req, res) {
    res.render("../Views/Home/About");
}