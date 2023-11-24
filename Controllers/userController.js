const User = require('../Models/User');


/*-------------------------------POST APIS-------------------------------*/


const followUserController = async function (req , res) {
	try {
		const me = req.user._id;
		const user = req.params.userID;

		const myAccount = await User.findOne({_id : me});
		if (!myAccount) {
			throw new Error('Error while fetching your account');
		} 
		const iWantToFollow = await User.findOne({_id : user});
		
		myAccount.followings.set(user.toString() , user);
		iWantToFollow.followers.set(me.toString() , me);

		await myAccount.save();
		await iWantToFollow.save();

		return res.status(200).send({
			success : true,
			message : 'Now you are following the user : ' + iWantToFollow.username,
			yourFollowings : myAccount.followings,
			usersFollowers : iWantToFollow.followers
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in followUserController Public API',
			error : error.message
		})
	}
};

const unfollowUserController = async function (req , res) {
	try {
		const me = req.user._id;
		const user = req.params.userID;

		const myAccount = await User.findById({_id : me});
		if (!me) {
			throw new Error('Error while fetching your account');
		}
		const iWantToUnfollow = await User.findOne({_id : user});
		myAccount.followings.delete(user);
		iWantToUnfollow.followers.delete(me);

		await myAccount.save();
		await iWantToUnfollow.save();

		return res.status(200).send({
			success : true,
			message : 'You are now not following the user : ' + iWantToUnfollow.username
		})

	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in unfollowUserController Public API',
			error : error.message
		});
	}
};


const disableAccountController = async function (req , res) {
	try {
		const id = req.params.userID;
		const user = await User.findById({_id : id});
		if (user.isAccountDisabled) {
			return res.status(400).send({
				success : false,
				message : 'Your account has already been disabled'
			});
		}
		user.isAccountDisabled = true;
		await user.save();
		return res.status(200).send({
			success : true,
			message : 'Your account has been disabled successfully'
		})

	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in disableAccountController Public API',
			error : error.message
		});
	}
};


const enableAccountController = async function (req , res) {
	try {
		const id = req.params.userID;
		const user = await User.findById({_id : id});
		if (!user.isAccountDisabled) {
			return res.status(400).send({
				success : false,
				message : 'Your account is already enabled'
			})
		}
		user.isAccountDisabled = false;
		await user.save();
		return res.status(200).send({
			success : true,
			message : 'Your account has been reactivated successfully'
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in enableAccountController Public API',
			error : error.message
		});
	}
};


const blockUserController = async function (req , res) {
	try {
		const userID = req.params.userID;
		const me = req.user;
		
		let myFollowings = me.followings;
		let myFollowers = me.followers;
		let myblockList = me.blockList;

		if (myblockList.includes(userID)) {
			return res.status(400).send({
				success : true,
				message : 'User already blocked by you'
			});
		}
		myblockList.push(userID);
		me.blockList = myblockList;
		if (myFollowings.has(userID)) {
			myFollowings.delete(userID);
		}
		if (myFollowers.has(userID)) {
			myFollowers.delete(userID);
		}

		me.followings = myFollowings;
		me.followers = myFollowers;
		await me.save();

		const user = await User.findById(userID); 
		let userFollowings = user.followings;
		let userFollowers = user.followers;
		
		const myId = me._id.toString();
		if (userFollowers.has(myId)) {
			userFollowers.delete(myId);
		}
		if (userFollowings.has(myId)) {
			userFollowings.delete(myId);
		}
		user.followers = userFollowers;
		user.followings = userFollowings;
		await user.save();

		return res.status(200).send({
			success : true,
			message : user.username + ' blocked successfully'
		})
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in blockUserController Public API',
			error : error.message
		})
	}
};

const unblockUserController = async function (req , res) {
	try {
		const userID = req.params.userID;
		const me = req.user;
		
		if (!me.blockList.includes(userID)) {
			return res.status(400).send({
				success : false,
				message : 'This user is not blocked by you'
			});
		}
		let myblockList = me.blockList;
		myblockList = myblockList.filter((id) => {
			return id.toString() !== userID;
		});
		me.blockList = myblockList;
		await me.save();

		const user = await User.findById(userID);
		return res.status(200).send({
			success : true,
			message : user.username + ' unblocked successfully'
		});

	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in unblockUserController Public API',
			error : error.message
		})
	}
};


/*--------------------------------GET APIS-------------------------------*/


const viewProfileController = async function (req , res) {
	try {
		let userId = req.params.userID;
		let username = req.body.username;
		const myAccount = req.user;

		if (userId) {
			const user = await User.findOne({_id : userId}); 

			if (!user || user.isAccountDisabled === true || user.blockList.includes(req.user._id) || myAccount.blockList.includes(user._id)) {
				return res.status(404).send({
					success : false,
					message : 'User not found'
				});
			}
			return res.status(200).send({
				success : true,
				message : 'User profile fetched successfully',
				username : user.username,
				fullName : user.fullName,
				bio : user.bio,
				followers : user.followers,
				followings : user.followings,
				posts : user.posts,
				_id : user._id
			});
		} 
		const user = await User.findOne({username});

		if (!user || user.isAccountDisabled === true || user.blockList.includes(req.user._id) || myAccount.blockList.includes(user._id)) {
			return res.status(404).send({
				success : false,
				message : 'User not found'
			});
		}
		return res.status(200).send({
			success : true,
			message : 'User profile fetched successfully',
			username : user.username,
			fullName : user.fullName,
			email : user.email,
			bio : user.bio,
			followers : user.followers,
			followings : user.followings,
			posts : user.posts,
			_id : user._id
		});

	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in viewProfileController Public API',
			error : error.message
		})
	}
};


const viewFollowingsController = async function (req , res) {
	try {
		const id = req.params.userID;
		const user = await User.findOne({_id : id});
		if (!user) {
			return res.status(404).send({
				success : false,
				message : 'User not found'
			});
		}
		const followings = user.followings;
		return res.status(200).send({
			success : true,
			message : 'Followers fetched successfully',
			followings : Array.from(followings.values())
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in viewFollowingsController Public API',
			error : error.message
		});
	}
};


const viewFollowersController = async function (req , res) {
	try {
		const id = req.params.userID;
		const user = await User.findOne({_id : id});
		if (!user) {
			return res.status(404).send({
				success : false,
				message : 'User not found'
			});
		}
		const followers = user.followers;
		return res.status(200).send({
			success : true,
			message : 'Followers fetched successfully',
			followers : Array.from(followers.values())
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in viewFollowersController Public API',
			error : error.message
		});
	}
};


/*--------------------------------PUT APIS-------------------------------*/


// TODO : Implement editProfileController
const editProfileController = async function (req , res) {
	try {

	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in editProfileController Public API',
			error : error.message
		});
	}
};


/*--------------------------------PUT APIS-------------------------------*/


// TODO : Implement deleteProfileController
const deleteProfileController = async function (req , res) {
	try {

	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in deleteProfileController Public API',
			error : error.message
		});
	}
};

module.exports = {
	followUserController,
	unfollowUserController,
	disableAccountController,
	enableAccountController,
	blockUserController,
	unblockUserController,
	viewProfileController,
	viewFollowingsController,
	viewFollowersController
}
