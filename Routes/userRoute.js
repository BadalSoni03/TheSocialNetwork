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
	viewFollowersController,
	editProfileController,
	approveFollowRequestsController,
	rejectFollowRequestsController,
	viewFollowRequestsController,
	getMutualAccountsController
} = require('../Controllers/userController');


/*-------------------------------POST APIs-------------------------------*/


/*
	@desc : Follows the user with id 'userID'
	@API : Protected Public
	@method : post
	@note : If the account is private then the request is pushed into the stack of the followRequests of the user
*/
router.post('/follow/:userID' , isAuth , followUserController);


/*
	@desc : Unfollows the user with id 'userID'
	@API : Protected Public
	@method : post
*/
router.post('/unfollow/:userID' , isAuth , unfollowUserController);


/*
	@desc : Disables the account of the logged in user
	@API : Protected Public
	@method : post
*/
router.post('/account/disable' , isAuth , disableAccountController);


/*
	@desc : Enables the account of the logged in user
	@API : Protected Public
	@method : post
*/
router.post('/account/enable' , isAuth , enableAccountController);


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


/*
	@desc :  Approves the follow requests
	@API : Protected Public
	@method : post
*/
router.post('/follow/requests/approve' , isAuth , approveFollowRequestsController);


/*
	@desc :  Rejects the follow requests
	@API : Protected Public
	@method : post
*/
router.post('/follow/requests/reject' , isAuth , rejectFollowRequestsController);


/*--------------------------------GET APIs-------------------------------*/


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


/*
	@desc : Gets the followerRequests of the user
	@API : Protected Public
	@method : get
*/
router.get('/account/follow-requests' , isAuth , viewFollowRequestsController);


/*
	@desc : Gets the mutual friends of a user randomly
	@API : Protected Public
	@method : get
*/
router.get('/account/mutuals' , isAuth , getMutualAccountsController);


/*--------------------------------PUT APIs-------------------------------*/


/*
	@desc : Edits the profile of the user
	@API : Protected Public
	@method : put
*/
router.put('/account/edit' , isAuth , editProfileController);


module.exports = router;
