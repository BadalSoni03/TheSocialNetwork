require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cloudinary = require('cloudinary');
const fileUpload = require('express-fileupload');
const connectDB = require('./db');

// database connection
connectDB();

const app = express();
const port = 3000 || process.env.PORT;
const host = process.env.HOST || 'localhost';

// middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(fileUpload({
	useTempFiles : true
}));


// routes
const authRouter = require('./Routes/authRoute');
const userRouter = require('./Routes/userRoute');
const postRouter = require('./Routes/postRoute');

app.use('/api/auth' , authRouter);
app.use('/api/user' , userRouter);
app.use('/api/post' , postRouter);


app.listen(port , () => {
	const url = 'http://' + host + ':' + port;
	console.log('Node server running on : ' + url);
});
