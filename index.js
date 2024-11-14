require("dotenv").config({path: "./.env"})

const express = require("express")
const app = express()
const cors = require("cors")
const { connectDb } = require("./config/db")
const port = 8000 || process.env.PORT
require("./queue/worker.js")

connectDb()

app.use(cors({
    origin:"*",
    credentials: true
}))
app.use(express.json({limit: "10mb"}))
app.use(express.urlencoded({extended: true}))
app.use("/api/auth",require("./routes/user.route.js"))
app.use("/api/file",require("./routes/upload.route.js"))

app.listen(port, () => {
    console.log(`server is running at port ${port}`)
})
