require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const authRouter = require('./Routes/authRoute');
const userRouter = require('./Routes/userRoute');

connectDB();

const app = express();
const port = 3000 || process.env.PORT;
const host = process.env.HOST;


app.use(express.json());
app.use('/api/auth' , authRouter);
app.use('/api/user' , userRouter);


app.listen(port , () => {
	const url = 'http://' + host + ':' + port;
	console.log('Node server running on : ' + url);
});
