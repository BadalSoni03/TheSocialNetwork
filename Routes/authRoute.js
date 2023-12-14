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


/*-------------------------------POST APIs-------------------------------*/


router.post('/register' , registerValidation , userValidation , registerController);


router.post('/login' , loginValidation , userValidation , loginController);


router.post('/logout' , isAuth , logoutController);


module.exports = router;
