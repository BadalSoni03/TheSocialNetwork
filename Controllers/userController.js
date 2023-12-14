const User = require('../Models/User');
const shuffleArray = require('../Utils/shuffleArray.js');
const cloudinary = require('../Utils/imageUpload');


/*-------------------------------POST Controllers-------------------------------*/


const followUserController = async function (req , res) {
	try {
		const me = req.user._id;
		const user = req.params.userID;

		if (me.toString() === user) {
			return res.status(400).send({
				success : false,
				message : 'You are not allowed to follow yourself'
			});
		}

		const userAccount = await User.findOne({_id : user});
		if (userAccount.isPublic) {
			const myAccount = req.user;
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
		} else {
			if (userAccount.followRequests.includes(req.user.username)) {
				return res.status(400).send({
					success : true,
					message : 'You have already sent the follow request to ' + userAccount.username
				});
			}
			userAccount.followRequests.push(req.user.username);
			await userAccount.save();
			return res.status(200).send({
				success : true,
				message : 'Your follow request has been sent to ' + userAccount.username
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			success : false,
			message : 'Error in followUserController Public API',
			error : error.message
		});
	}
};


const approveFollowRequestsController = async function (req , res) {
	try {
		const me = req.user;
		const myId = req.user._id;
		const followRequests = me.followRequests;
		const user = followRequests[followRequests.length - 1];
		followRequests.pop();

		const userProfile = await User.findOne({username : user});
		const userId = userProfile._id;
		
		me.followers.set(userId.toString() , userId);
		me.followRequests = followRequests;
		await me.save();

		userProfile.followings.set(myId.toString() , myId);
		await userProfile.save();

		return res.status(200).send({
			success : true,
			message : user + ' started following you'
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in approveFollowRequestsController Public API',
			error : error.message
		});
	}
};


const rejectFollowRequestsController = async function (req , res) {
	try {
		const me = req.user;
		const myId = req.user._id;
		const followRequests = me.followRequests;
		const user = followRequests[followRequests.length - 1];
		followRequests.pop();
		
		me.followRequests = followRequests;
		await me.save();

		return res.status(200).send({
			success : true,
			message : 'Follow request of ' + user + ' has been successfully rejected'
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in rejectFollowRequestsController Public API',
			error : error.message
		});
	}
};


const unfollowUserController = async function (req , res) {
	try {
		const me = req.user._id;
		const user = req.params.userID;

		const myAccount = req.user;
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
		});

	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in unfollowUserController Public API',
			error : error.message
		});
	}
};


const blockUserController = async function (req , res) {
	try {
		const userID = req.params.userID;
		const me = req.user;

		if (userID === me._id) {
			return res.status(400).send({
				success : false,
				message : 'You cannot block yourself'
			});
		}
		
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
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in blockUserController Public API',
			error : error.message
		});
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
		});
	}
};


const removeFollowerController = async function (req , res) {
	try {
		const userID = req.params.userID;
		const me = req.user;
		const myFollowers = me.followers;

		const user = await User.findById({_id : userID});
		const userFollowings = user.followings;
		
		if (!myFollowers.has(userID)) {
			return res.status(400).send({
				success : false,
				message : 'User not found in your followers'
			});
		}

		const myId = me._id.toString();

		userFollowings.delete(myId);
		user.followings = userFollowings;

		myFollowers.delete(userID);
		me.followers = myFollowers;
		
		await user.save();
		await me.save();

		return res.status(200).send({
			success : true,
			message : 'User successfully removed from your followers'
		});

	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in removeFollowerController Public API',
			error : error.message
		});
	}
};


const muteUserController = async function (req , res) {
	try {	
		const userID = req.params.userID;
		const me = req.user;

		if (userID === me._id.toString()) {
			return res.status(400).send({
				success : false,
				message : 'You cannot mute yourself'
			});
		}

		const mutedByMe = me.mutedUsers;

		if (mutedByMe.includes(userID)) {
			return res.status(400).send({
				success : false,
				message : 'Already muted'
			});
		}

		mutedByMe.push(userID);
		me.mutedUsers = mutedByMe;
		await me.save();

		return res.status(200).send({
			success : true,
			message : 'muted successfully'
		});

	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in muteUserController Public API',
			error : error.message
		});
	}
};


const unmuteUserController = async function (req , res) {
	try {
		const userID = req.params.userID;
		const me = req.user;
		let mutedByMe = me.mutedUsers;

		console.log(mutedByMe);

		if (!mutedByMe.includes(userID)) {
			return res.status(400).send({
				success : false,
				message : 'Not muted by you'
			});
		}

		mutedByMe = mutedByMe.filter(id => {
			return id.toString() !== userID;
		});

		me.mutedUsers = mutedByMe;
		await me.save();

		return res.status(200).send({
			success : true,
			message : 'unmuted successfully'
		});
	} catch (error) {
		return res.status(500).send({
			success : true,
			message : 'Error in unmuteUserController Public API',
			error : error.message
		});
	}
};


/*--------------------------------GET Controllers-------------------------------*/


const viewProfileController = async function (req , res) {
	try {
		let userId = req.params.userID;
		let username = req.body.username;
		const myAccount = req.user;

		if (userId) {
			const user = await User.findOne({_id : userId}).populate('posts'); 
			if (!user || user.isAccountDisabled === true || user.blockList.includes(req.user._id) || myAccount.blockList.includes(user._id)) {
				return res.status(404).send({
					success : false,
					message : 'User not found'
				});
			}

			if (!user.isPublic) {
				return res.status(200).send({
					success : true,
					message : 'Private profile, Follow this profile to see their posts',
					username : user.username,
					bio : user.bio,
					followers : user.followers.size,
					followings : user.followings.size,
					posts : user.posts
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
		const user = await User.findOne({username}).populate('posts');
		
		if (!user || user.isAccountDisabled === true || user.blockList.includes(req.user._id) || myAccount.blockList.includes(user._id)) {
			return res.status(404).send({
				success : false,
				message : 'User not found'
			});
		}
		
		if (!user.isPublic) {
			return res.status(200).send({
				success : true,
				message : 'Private profile, follow this profile to see their posts',
				username : user.username,
				fullName : user.fullName,
				bio : user.bio,
				followers : user.followers.size,
				followings : user.followings.size,
				posts : user.posts
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
		});
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
		if (!user.isPublic) {
			return res.status(200).send({
				success : true,
				message : 'Private profile, follow this profile to see their posts',
				username : user.username,
				fullName : user.fullName,
				bio : user.bio,
				followers : user.followers.size,
				followings : user.followings.size
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
		if (!user.isPublic) {
			return res.status(200).send({
				success : true,
				message : 'Private profile, follow this profile to see their posts',
				username : user.username,
				fullName : user.fullName,
				bio : user.bio,
				followers : user.followers.size,
				followings : user.followings.size
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


const viewFollowRequestsController = async function (req , res) {
	try {
		return res.status(200).send({
			success : true,
			message : 'Follow requests fetched successfully',
			followRequests : req.user.followRequests
		});
	} catch (error) {
		return res.status(500).send({
			success : true,
			message : 'Error in viewFollowersController Public API',
			error : error.message
		});
	}
};


const getMutualAccountsController = async function (req , res) {
	try {
		const me = req.user;
		const followings = req.user.followings;
		let mutualsSet = new Set();

		const limit = 15;

		const q = [[me._id , 0]];
		const vis = new Set();
		vis.add(me._id);

		while (q.length) {
			const front = q.shift();
			const node = front[0];
			const lvl = front[1];

			if (lvl === 2) {
				mutualsSet.add(node);
			}
			if (mutualsSet.size >= limit) {
				break;
			}
			if (lvl > 2) {
				break;
			}

			const childsMap = await User.findOne({_id : node});
			let childs = Array.from(childsMap.followings.keys());
			childs = shuffleArray(childs);

			for (const child of childs) {
				if (vis.has(child)) {
					continue;
				}
				vis.add(child);
				q.push([child , lvl + 1]);
			}
		}

		let mutuals = [...mutualsSet];
		let mutualFriends = await User.find({_id : {
			$in : mutuals
		}} , {
			username : 1,
			fullName : 1,
			_id : 1,
			email : 1,
			followings : 1,
			followers : 1,
			bio : 1,
			isPublic : 1
		});

		return res.status(200).send({
			success : true,
			message : 'Mutuals fetched',
			size : mutualFriends.length,
			mutualFriends : mutualFriends
		});
	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in getMutualAccountsController Public API',
			error : error.message
		});
	}
};


const getMutedUsersController = async function (req , res) {
	try {
		const mutedAccountsLists = req.user.mutedUsers;
		const mutedUsers = await User.find({_id : {
			$in : mutedAccountsLists
		}} , {
			_id : 1,
			username : 1,
			fullName : 1
		});

		return res.status(200).send({
			success : true,
			mutedAccounts : mutedUsers			
		});
	} catch (error) {
		return res.status(500).send({
			success : true,
			message : 'Error in getMutedUsersController Public API',
			error : error.message
		});
	}
};


/*--------------------------------PATCH Controllers-------------------------------*/


const disableAccountController = async function (req , res) {
	try {
		const id = req.user._id;
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
		});

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
		const id = req.user._id;
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


const editProfileController = async function (req , res) {
	try {
		const me = req.user;
		const {username , bio} = req.body; 

		if (username && bio) {
			if (username.trim() === '') {
				return res.status(400).send({
					success : false,
					message : 'username cannot be empty'
				});
			}

			if (bio.length) {
				me.bio = bio;
			}
			const usernameTaken = await User.findOne({username});
			if (usernameTaken) {
				return res.status(400).send({
					success : false,
					message : username + ' already been taken, try another username'
				})
			}
			me.username = username;
			await me.save();

		} else if (username) {
			if (username.trim() === '') {
				return res.status(400).send({
					success : false,
					message : 'username cannot be empty'
				});
			}

			const usernameTaken = await User.findOne({username});
			if (usernameTaken) {
				return res.status(400).send({
					success : false,
					message : username + ' already been taken, try another username'
				})
			}
			me.username = username;
			await me.save();

		} else if (bio && bio.length) {
			me.bio = bio;
			await me.save();
		}
		return res.status(200).send({
			success : true,
			message : 'Profile edited successfully',
			username : me.username,
			bio : me.bio
		});
 	} catch (error) {
		return res.status(500).send({
			success : false,
			message : 'Error in editProfileController Public API',
			error : error.message
		});
	}
};

const editProfilePicController = async function (req , res) {
	try {
		const pic = req.files.profilePhoto;

		const me = req.user;
		const result = await cloudinary.uploader.upload(pic.tempFilePath , {
			public_id : me._id + '_profile'
		});

		me.profilePhoto.public_id = result.public_id;
		me.profilePhoto.url = result.secure_url;

		await me.save();

		return res.status(200).send({
			success : true,
			url : result.secure_url
		});

	} catch (error) {
		console.log(error);
		return res.status(500).send({
			success : false,
			message : 'Error in editProfilePicController Public API',
			error : error.message
		});
	}
}


module.exports = {
	followUserController,
	unfollowUserController,
	disableAccountController,
	enableAccountController,
	blockUserController,
	unblockUserController,
	viewProfileController,
	viewFollowingsController,
	viewFollowersController,
	editProfileController,
	approveFollowRequestsController,
	rejectFollowRequestsController,
	viewFollowRequestsController,
	getMutualAccountsController,
	removeFollowerController,
	muteUserController,
	getMutedUsersController,
	unmuteUserController,
	editProfilePicController
}
