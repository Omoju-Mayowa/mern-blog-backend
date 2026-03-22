import { Router } from 'express'
import { sendResetOTP, verifyOTP, resetPassword } from '../controllers/passwordResetController.js'
import {
  registerUser, loginUser, getUser, changeAvatar,
  editUser, getAuthors, updateUserProfile, me, logout, refreshToken
} from '../controllers/userControllers.js'
import verifyToken from '../middleware/authMiddleware.js'
import { loginRateLimiter } from '../middleware/loginRateLimiter.js'

const router = Router()

// Public
router.post('/register', registerUser)
router.post('/login', loginRateLimiter, loginUser)
router.post('/verify-otp', verifyOTP)
router.post('/forgot-password', sendResetOTP)
router.post('/reset-password', resetPassword)

// Auth
router.post('/logout', logout)
router.post('/refresh', refreshToken)
router.get('/me', verifyToken, me)

// Authors list
router.get('/', getAuthors)

// Protected
router.post('/change-avatar', verifyToken, changeAvatar)
router.patch('/edit-user', verifyToken, editUser)

// Param routes LAST
router.get('/:id', getUser)
router.patch('/:id', verifyToken, updateUserProfile)

export default router