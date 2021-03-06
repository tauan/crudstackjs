const express = require("express")
const mongoose = require("mongoose")
const routes = require('./routes.js')
const cors = require('cors')
const http = require('http')
const { setupWebsocket } = require('./websocket')

const app = express()
const server = http.Server(app)

setupWebsocket(server)

mongoose.connect('mongodb+srv://tauan:bola123bola@cluster0-ksctg.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
app.use(cors())
app.use(express.json())
app.use(routes)


server.listen(3333)