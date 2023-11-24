const router = require('express').Router();
const isAuth = require('../Middlewares/isAuth');
const {
	followUserController,
	unfollowUserController,
	disableAccountController,
	enableAccountController,
	blockUserController,
	unblockUserController,
	viewProfileController,
	viewFollowingsController,
	viewFollowersController
} = require('../Controllers/userController');

/*-------------------------------POST APIS-------------------------------*/


/*
	@desc : Follows the user with id 'userID'
	@API : Protected Public
	@method : post
*/
router.post('/follow/:userID' , isAuth , followUserController);


/*
	@desc : Unfollows the user with id 'userID'
	@API : Protected Public
	@method : post
*/
router.post('/unfollow/:userID' , isAuth , unfollowUserController);


/*
	@desc : Disables the account of the user with id 'userID'
	@API : Protected Public
	@method : post
*/
router.post('/account/disable/:userID' , isAuth , disableAccountController);


/*
	@desc : Enables the account of the user with id 'userID'
	@API : Protected Public
	@method : post
*/
router.post('/account/enable/:userID' , isAuth , enableAccountController);


/*
	@desc : Blocks the user with id 'userID'
	@API : Protected Public
	@method : post
*/
router.post('/block/:userID' , isAuth , blockUserController);


/*
	@desc : Unblocks the user with id 'userID'
	@API : Protected Public
	@method : post
*/
router.post('/unblock/:userID' , isAuth , unblockUserController);


/*--------------------------------GET APIS-------------------------------*/


/*
	@desc : Gets the profile of the user with id 'userID'
	@API : Protected Public
	@method : get
*/
router.get('/profile/:userID' , isAuth , viewProfileController);


/*
	@desc : Gets the profile of the user from req.body
	@API : Protected Public
	@method : get
*/
router.get('/profile' , isAuth , viewProfileController);


/*
	@desc : Gets the followings of the user with id 'userID'
	@API : Protected Public
	@method : get
*/
router.get('/profile/followings/:userID' , isAuth , viewFollowingsController);


/*
	@desc : Gets the followers of the user with id 'userID'
	@API : Protected Public
	@method : get
*/
router.get('/profile/followers/:userID' , isAuth , viewFollowersController);


module.exports = router;
