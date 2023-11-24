const router = require('express').Router();
const isAuth = require('../Middlewares/isAuth');
const {
	registerValidation,
	loginValidation,
	userValidation
} = require('../Middlewares/Validation/validateUser');
const {
	registerController,
	loginController,
	logoutController
} = require('../Controllers/authController');


/*-------------------------------POST APIS-------------------------------*/


/*
	@desc : Registers the user in the application
	@API : Public
	@method : post
*/
router.post('/register' , registerValidation , userValidation , registerController);


/*
	@desc : Logs in the user in the application
	@API : Public
	@method : post
*/
router.post('/login' , loginValidation , userValidation , loginController);


/*
	@desc : Logs out the user from the application
	@API : Public
	@method : post
*/
router.post('/logout' , isAuth , logoutController);

module.exports = router;
