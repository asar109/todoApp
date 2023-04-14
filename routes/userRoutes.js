const {Router} = require('express')
const { registerUser, OTPVerification, login, logout, userProfile, addTask, removeTask, allTasks ,taskInfo, updateTask, updatePassword, updateProfile} = require('../controllers/userController')
const { isAuthenticated } = require('../middlewares/isAuth')
const router = Router()

router.route('/register').post(registerUser)
router.route('/otp/verify').post(isAuthenticated,OTPVerification)
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/profile').get(isAuthenticated, userProfile )
router.route('/add/task').post(isAuthenticated, addTask )
router.route('/task/:taskid').delete(isAuthenticated, removeTask ).put(isAuthenticated, updateTask).get(isAuthenticated, taskInfo)
router.route('/tasks').get(isAuthenticated, allTasks)
router.route('/update/password').put(isAuthenticated, updatePassword)
router.route('/update/profile').put(isAuthenticated, updateProfile)



module.exports = router




