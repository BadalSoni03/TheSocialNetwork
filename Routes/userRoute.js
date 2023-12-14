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
	getMutualAccountsController,
	removeFollowerController,
	muteUserController,
	getMutedUsersController,
	unmuteUserController,
	editProfilePicController
} = require('../Controllers/userController');


/*-------------------------------POST APIs-------------------------------*/


router.post('/follow/:userID' , isAuth , followUserController);


router.post('/unfollow/:userID' , isAuth , unfollowUserController);


router.post('/block/:userID' , isAuth , blockUserController);


router.post('/unblock/:userID' , isAuth , unblockUserController);


router.post('/follow/requests/approve' , isAuth , approveFollowRequestsController);


router.post('/follow/requests/reject' , isAuth , rejectFollowRequestsController);


router.post('/account/followers/remove/:userID' , isAuth , removeFollowerController);


router.post('/mute/:userID' , isAuth , muteUserController);


router.post('/unmute/:userID' , isAuth , unmuteUserController);


/*--------------------------------GET APIs-------------------------------*/


router.get('/profile/:userID' , isAuth , viewProfileController);


router.get('/profile' , isAuth , viewProfileController);


router.get('/profile/followings/:userID' , isAuth , viewFollowingsController);


router.get('/profile/followers/:userID' , isAuth , viewFollowersController);


router.get('/account/follow-requests' , isAuth , viewFollowRequestsController);


router.get('/account/mutuals' , isAuth , getMutualAccountsController);


router.get('/account/muted-users' , isAuth , getMutedUsersController);


/*--------------------------------PATCH APIs-------------------------------*/


router.post('/account/disable' , isAuth , disableAccountController);


router.post('/account/enable' , isAuth , enableAccountController);


router.patch('/account/edit' , isAuth , editProfileController);


router.patch('/account/edit/profile-pic' , isAuth , editProfilePicController);


module.exports = router;
