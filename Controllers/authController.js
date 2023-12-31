const User = require('../Models/User');
const JWT = require('jsonwebtoken');
const cloudinary = require('../Utils/imageUpload');


/*-------------------------------POST Controllers-------------------------------*/


const registerController = async function (req , res) {
	try {
		const {
			fullName,
			username,
			email,
			password,
			bio
		} = req.body;

		const userName = await User.findOne({username});
		const userEmail = await User.findOne({email});
		if (userName || userEmail) {
			throw new Error('Username / userEmail already taken');
		}

		const newUser = await User({
			username,
			fullName,
			email,
			password,
			bio
		});

		const pic = req.files.profilePhoto;

		if (pic) {
			const result = await cloudinary.uploader.upload(pic.tempFilePath , {
				public_id : newUser._id + '_profile'
			});
			newUser.profilePhoto.public_id = result.public_id;
			newUser.profilePhoto.url = result.secure_url;
		}

		await newUser.save();

		return res.status(201).send({
			success : true,
			message : 'User registered successfully',
			newUser
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			success : false,
			message : 'Error in registerController Public API',
			error : error.message
		})
	}
};

const loginController = async function (req , res) {
	try {
		const {email , password} = req.body;
		const user = await User.findOne({email});
		if (!user) {
			return res.status(404).send({
				success : false,
				message : 'User not registered'
			});
		}
		const isMatch = await user.comparePasswords(password);
		if (!isMatch) {
			return res.status(400).send({
				success : false,
				message : 'email / password not matching'
			});
		}
		const token = JWT.sign({userId : user._id} , process.env.JWT_SECRET_KEY , {expiresIn : '1d'});
		let oldTokens = user.tokens || [];
		
		if (oldTokens.length) {
			oldTokens = oldTokens.filter(tkn => {
				const timeDiff = (Date.now() - parseInt(tkn.signedAt)) / 1000;
				if (timeDiff < 86400) {
					return tkn;
				}
			});
		}

		await User.findByIdAndUpdate(user._id , {
			tokens : [...oldTokens , {
				token,
				signedAt : Date.now().toString()
			}]
		});
		const info = {
			Username : user.username,
			email : user.email,
			token : token
		};
		return res.status(200).send({
			success : true,
			message : 'User logged in successfully',
			info
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in loginController Public API',
			error : error.message
		});
	}
}

const logoutController = async function (req , res) {
	try {
		if (req.headers && req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1];
			if (!token) {
				return res.status(501).send({
					success : false,
					message : 'Authorization failed'
				});
			}
			const tokens = req.user.tokens;
			const notExpiredTokens = tokens.filter(t => t.token !== token);
			await User.findByIdAndUpdate(req.user._id , {tokens : notExpiredTokens});
			return res.status(201).send({
				success : true,
				message : 'logged out successfully'
			});
		} else {
			return res.status(501).send({
				success : false,
				message : 'Cannot logout'
			});
		}
	} catch (error) {
		return res.status(501).send({
			success : false,
			message : 'Error in logoutController Public API',
			error : error.message
		});
	}
};

module.exports = {
	registerController,
	loginController,
	logoutController
}
