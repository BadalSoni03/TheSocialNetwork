const mongoose = require('mongoose');
 
const commentModel = new mongoose.Schema({
	comment : {
		type : String
	},
	likes : {
		type : Number,
		default : 0
	}
},{timestamp : true});

module.exports = mongoose.model('Comment' , commentModel); 
