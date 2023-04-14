const app = require('./app')
const mongoConnect = require('./config/mongoDB')
const cloudinary = require('cloudinary')
require('dotenv').config({path: './config/config.env'})

// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})



mongoConnect()
app.listen(process.env.PORT, ()=>{
    console.log('Server is up on port ' + process.env.PORT)
})