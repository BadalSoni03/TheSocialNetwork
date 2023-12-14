const router = require('express').Router();
const isAuth = require('../Middlewares/isAuth');
const {
	createPostController
} = require('../Controllers/postController');


/*-------------------------------POST APIs-------------------------------*/


router.post('/create' , isAuth , createPostController);


module.exports = router;
