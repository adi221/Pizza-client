export const API_BASE_URL = 'http://localhost:8080/api'

export const getAuthToken = () => {
  const token = localStorage.getItem('token')
  return token ? `Bearer ${token}` :  undefined
}

export const setTokenInStorage = token => {
  localStorage.setItem('token', token)
}

export const getTokenInStorage = token => {
  localStorage.getItem('token', token)
}

const post = async (url, data) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  
  const responseData = await response.json()
  if (response.status >= 400 && response.status <= 500) {
    throw responseData
  }
  return responseData
}

const get = async url => fetch(url, {
  method: "GET",
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json",
    authorization: getAuthToken()
  },
}).then(response => response.json())

export const http = {
  post,
  get
}

export const login = async userDetails => {
  try {
    const res = await post(`${API_BASE_URL}/users/login`, userDetails)
    const { token, user } = res
    setTokenInStorage(token)
    return user
  } catch (error) {
    throw error
  }
}

export const signup = async userDetails => {
  try {
    const res = await http.post(`${API_BASE_URL}/users/signup`, userDetails)
    const { user } = res
    return user
  } catch (error) {
    console.log('Failed to sign up', error);
    throw error
  }
}