const mongoose = require('mongoose');

const postModel = new mongoose.Schema({
	post : [{
		type : String,
		required : true
	}],
	postType : {
		type : String,
		required : true
	},
	postedBy : {
		type : mongoose.Types.ObjectId,
		ref : 'User',
		required : true
	},
	likes : {
		type : mongoose.Types.ObjectId,
		ref : 'User'
	},
	caption : {
		type : String,
		required : true
	},
	comments : [{
		type : mongoose.Types.ObjectId,
		ref : 'Comment'
	}]
} , {timestamp : true})

module.exports = mongoose.model('Post' , postModel);
