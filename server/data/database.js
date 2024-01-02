const mongoose = require("mongoose")

const tableSchema = new mongoose.Schema({
    fullname: String,
    username: String,
    email: String,
    company: String,
},
{
    collection: "table-data",
})

const Table = mongoose.model("TableData",tableSchema)

module.exports = Table