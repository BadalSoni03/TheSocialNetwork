require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async function () {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('DB connection successfull');
	} catch (error) {
		console.log('Error while connecting with db : ' + error);
	}
};

module.exports = connectDB;
