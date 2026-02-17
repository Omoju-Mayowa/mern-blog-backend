import { createContext, useEffect, useState } from "react";


export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  })
  
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])
  
  useEffect(() => {
    const validateSess = async() => {
      try {
        const res = await API.get("/users/me")
        setCurrentUser(res.data?.user)
      } catch(err) {
        setCurrentUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    validateSess()
  }, [])
  
  
  const logout = async () => {
    try {
      await API.get("/users/logout")
    } catch (err) { }
      finally {
        setCurrentUser(null)
        localStorage.removeItem('currentUser')
    }
  }

    return <UserContext.Provider value={{currentUser, setCurrentUser, loading, logout}}>{children}</UserContext.Provider>
}

export default UserProvider