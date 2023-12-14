const mongoose = require('mongoose');

const postModel = new mongoose.Schema({
	postMedia : [{
		public_id : String,
		url : String
	}],
	postedBy : {
		type : mongoose.Types.ObjectId,
		ref : 'User',
		required : true
	},
	likes : [{
		type : mongoose.Types.ObjectId,
		ref : 'User'
	}],
	caption : {
		type : String
	},
	comments : [{
		type : mongoose.Types.ObjectId,
		ref : 'Comment'
	}],
	tags : [{
		type : mongoose.Types.ObjectId,
		ref : 'User'
	}]
} , {timestamp : true})

module.exports = mongoose.model('Post' , postModel);
