const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const cors = require('cors')
// import Routes
const userRoutes = require("./routes/userRoutes");
const fileUpload = require("express-fileupload");


// using Middleware


app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    limits : {fileSize : 50 * 1024 * 1024}
}))
app.use(cors())


// using Routes

app.use("/api/v1", userRoutes);

module.exports = app;
