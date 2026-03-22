import jwt from 'jsonwebtoken'
import { HttpError } from '../models/errorModel.js'

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return next(new HttpError("Unauthorized", 401))
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new HttpError("Token expired", 401))
    }
    return next(new HttpError("Unauthorized", 401))
  }
}

export default verifyToken