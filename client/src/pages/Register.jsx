import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from './components/axios.js'

const scrollTop = () => window.scrollTo(0, 0)

const Register = () => {
  const [userData, setUserData] = useState({
    name: '', email: '', password: '', password2: ''
  })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  const changeInputHandler = (e) => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const registerUser = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await API.post('/users/register', userData)
      if (!response.data) {
        setError('Registration failed. Please try again.')
      } else {
        navigate('/login', { state: { email: userData.email } })
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="register">
      <div className="container">
        <h2>Sign Up</h2>
        <form className="form register__form" onSubmit={registerUser}>
          {error && <p className="form__error-message">{error}</p>}
          <input type="text" placeholder='Full Name' name='name'
            value={userData.name} onChange={changeInputHandler} autoFocus disabled={loading} />
          <input type="email" placeholder='Email' name='email'
            value={userData.email} onChange={changeInputHandler} disabled={loading} />
          <input type="password" placeholder='Password' name='password'
            value={userData.password} onChange={changeInputHandler} disabled={loading} />
          <input type="password" placeholder='Confirm Password' name='password2'
            value={userData.password2} onChange={changeInputHandler} disabled={loading} />
          <button type="submit" className='btn primary' disabled={loading} onClick={scrollTop}
            style={{ opacity: loading ? 0.75 : 1, transition: 'opacity 0.2s ease' }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <small>Already have an account? <Link to="/login" onClick={scrollTop}>Sign In</Link></small>
      </div>
    </section>
  )
}

export default Register