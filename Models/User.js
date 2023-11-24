const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// TODO : Add 'tags' field
const userModel = new mongoose.Schema({
	username : {
		type : String,
		required : true,
		lowercase : true,
		unique : true
	},
	fullName : {
		type : String,
		required : true
	},
	email : {
		type : String,
		required : true,
		unique : true
	},
	password : {
		type : String,
		required : true
	},
	profilePhoto : {
		type : String
	},
	bio : {
		type : String,
	},
	followers : {
		type : Map,
		of : {
			type : 'ObjectId',
			ref : 'User'
		},
		default : new Map()
	},
	followings : {
		type : Map,
		of : {
			type : 'ObjectId',
			ref : 'User'
		},
		default : new Map()
	},
	posts : {
		type : Array,
		of : {
			type : 'ObjectId',
			ref : 'Post'
		},
		default : []
	},
	isAccountDisabled : {
		type : Boolean,
		default : false
	},
	blockList : {
		type : Array,
		of : {
			type : 'ObjectId',
			ref : 'User'
		},
		default : []
	},
	tokens : [{type : Object}]
} , {timestamp : true});
 

userModel.pre('save' , async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(this.password ,  salt);
	this.password = hashedPassword;
	next();
});

userModel.methods.comparePasswords = async function (password) {
	try {
		return await bcrypt.compare(password , this.password);
	} catch (error) {
		console.log('Error while comparing passwords : ' + error);
	}
};

module.exports = mongoose.model('User' , userModel);
