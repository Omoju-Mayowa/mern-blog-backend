import React, {useContext, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from './components/context/userContext'
import API from './components/axios.js'


const Logout = () => {
  const {setCurrentUser} = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await axios.post('user/logout')
      } catch (_) { }
        finally {
          setCurrentUser(null)
          localStorage.removeItem('currentUser')
          navigate('/login')
        } 
    }
    
    performLogout()
  }, [])


  setCurrentUser(null)



  return (
    <></>
  )
}

export default Logout