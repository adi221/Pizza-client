export const API_BASE_URL = 'http://localhost:8080/api'

export const getAuthToken = () => {
  const token = localStorage.getItem('token')
  return token ? `Bearer ${token}` :  undefined
}

export const setTokenInStorage = token => {
  localStorage.setItem('token', token)
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


export const login = async userDetails => {
  const res = await post(`${API_BASE_URL}/users/login`, userDetails)
  const { token, user } = res
  setTokenInStorage(token)
  return user
}

const emailInputEl = document.querySelector('#email');
const passwordInputEl = document.querySelector('#password');
const loginForm = document.querySelector('.login-form');

const loginUser = async details => {
  try {
    await login(details)
    window.open('/index.html', "_self")
  } catch (error) {
    console.error('Failed to login', error)
    alert('Failed to login, invalid credentials')
  }
}

const onLoginButtonClick = async e => {
  e.preventDefault();
  const emailValue = emailInputEl.value;
  const passwordValue = passwordInputEl.value;
  // validation: is email format correct, is password in certain length
  await loginUser({ email: emailValue, password: passwordValue })
}


// loginButtonEl.addEventListener('submit', onLoginButtonClick);
loginForm.addEventListener('submit', onLoginButtonClick);