const mongoose = require('mongoose')

const dbConnect = async () => {
    const { connection } = await mongoose.connect(process.env.URI);
    console.log(`Database connect successfully on ${connection.host}`);
};

module.exports = dbConnect