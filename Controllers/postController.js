const Post = require('../Models/Post');
const User = require('../Models/User');
const cloudinary = require('cloudinary');

// TODO : Add the newly created post in the tagged posts field of the tagged users


/*-------------------------------POST Controllers-------------------------------*/


const createPostController = async function (req , res) {
	try {
		const postMedia = req.files.images;
		const tags = req.body.tags;

		const me = req.user;
		const myPosts = me.posts;

		let postArray = [];

		let cnt = 1;
		for (const media of postMedia) {
			const result = await cloudinary.uploader.upload(media.tempFilePath , {
				public_id : me._id + '_profile_' + cnt
			});
			cnt++;
			const post = {
				public_id : result.public_id,
				url : result.secure_url
			};
			postArray.push(post);
		}

		console.log(tags);

		let newPost = undefined;
		if (tags) {
			let tagged = [];
			for (const friend of tags) {
				const user = await User.findOne({username : friend} , {
					_id : 1,
					username : 1,
					profilePhoto : 1
				});
				tagged.push(user);
			}
			newPost = await Post.create({
				postMedia : postArray,
				postedBy : me._id,
				tags : tagged
			});
		} else {
			newPost = await Post.create({
				postMedia : postArray,
				postedBy : me._id
			});
		}

		myPosts.push(newPost);

		me.posts = myPosts;
		await me.save();

		return res.status(200).send({
			success : true,
			newPost
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			massage : 'Error in createPostController Public API',
			error : error.message
		})
	}
};



module.exports = {
	createPostController
}
