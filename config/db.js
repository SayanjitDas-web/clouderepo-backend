const mongoose = require("mongoose")

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("mongoDb connected successfully!")
    } catch (error) {
        console.log("monoDb connection error:",error)
    }
}

module.exports = {connectDb}