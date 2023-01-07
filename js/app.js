// #region Server
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
      'Content-Type': 'application/json',
      authorization: getAuthToken()
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

export const signup = async userDetails => {
  const res = await http.post(`${API_BASE_URL}/users/signup`, userDetails)
  const { user } = res
  return user
}

export const getMeals = async () => {
  const { items, total } = await http.get(`${API_BASE_URL}/meals`)
  return { items, total }
}

export const getMealById = async id => {
  return http.get(`${API_BASE_URL}/meals/${id}`)
}

export const createOrder = async list => {
  await http.post(`${API_BASE_URL}/orders`, { list })
}
// #endregion

// #region Mobile navigation
const btnNavEl = document.querySelector(".btn-mobile-nav");
const headerEl = document.querySelector(".header");

btnNavEl.addEventListener("click", function () {
  headerEl.classList.toggle("nav-open");
});
// #endregion

// #region Smooth scrolling animation
const allLinks = document.querySelectorAll("a:link");

allLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const href = link.getAttribute("href");

    // Scroll back to top
    if (href === "#")
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    // Scroll to other links
    if (href !== "#" && href.startsWith("#")) {
      const sectionEl = document.querySelector(href);
      sectionEl.scrollIntoView({ behavior: "smooth" });
    }

    // Close mobile naviagtion
    if (link.classList.contains("main-nav-link"))
      headerEl.classList.toggle("nav-open");
  });
});
// #endregion

// #region Sticky navigation
const sectionHeroEl = document.querySelector(".section-hero");

const obs = new IntersectionObserver(
  function (entries) {
    const ent = entries[0];

    if (ent.isIntersecting === false) {
      document.body.classList.add("sticky");
    }

    if (ent.isIntersecting === true) {
      document.body.classList.remove("sticky");
    }
  },
  {
    // In the viewport
    root: null,
    threshold: 0,
    rootMargin: "-80px",
  }
);
obs.observe(sectionHeroEl);
// #endregion

// #region Cart
const cartListEl = document.querySelector('.cart-items')
const removeAllButtonEl = document.querySelector('.cart-action')
const checkoutButtonEl = document.querySelector('.cart-submit-button')

class Cart {
  total = 0
  cartItems = []

  init() {
    this.initCartElements()
  }

  initCartElements() {
    this.renderItems()
    this.total = this.getTotalCost()
    this.updateTotalPriceTextContent()
    this.updateTotalItemsTextContent()
    this.registerListeners()
  }

  registerListeners() {
    const self = this
    removeAllButtonEl.addEventListener('click', this.deleteItems.bind(this))
    checkoutButtonEl.addEventListener('click', this.checkoutOrder.bind(this))
    const removeItemButtons = document.querySelectorAll('.cart-remove')
    removeItemButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const clickedNode = e.target
        const mealEl = clickedNode.closest('.cart-item')
        const mealId = mealEl.dataset.id
        if (!mealId) return
        self.deleteItem(mealId)
      })
    })
    
  }

  addItemToCart(item) {
    this.cartItems.push(item)
  }

  renderItems() {
    cartListEl.innerHTML = ""
    if (this.cartItems.length === 0) {
      const html = '<p>Cart is empty.</p>'
      cartListEl.insertAdjacentHTML('afterbegin', html)
      return
    }
    this.cartItems.forEach(this.renderItem.bind(this))
  }

  renderItem({ id, price, title, subtitle, imageUrl}) {
    const html = `
      <div class="cart-item" data-id="${id}">
      <div class="cart-item-info">
        <img class="cart-image-box" src="${imageUrl}"  />
        <div class="cart-about">
          <h2 class="cart-about-title">${title}</h2>
          <h3 class="cart-about-subtitle">${subtitle}</h3>
        </div>
      </div>
      <div class="cart-counter-prices"></div>
        <div class="cart-prices">
          <div class="cart-amount"> &#8362; ${price}</div>
          <div class="cart-remove"><u>Remove</u></div>
        </div>
      </div>
    `
    cartListEl.insertAdjacentHTML('afterbegin', html)
  }

  getTotalCost() {
    let total = 0
    this.cartItems.forEach(item => {
      total += item.price
    })
    return total
  }

  updateTotalPriceTextContent(total = this.total) {
    const cartTotalCostEl = document.querySelector('.cart-total-amount')
    cartTotalCostEl.textContent =  `₪${total}`
  }

  updateTotalItemsTextContent() {
    const cartTotalItemsEl = document.querySelector('.cart-items-total')
    cartTotalItemsEl.textContent = `${this.cartItems.length} Items`
  }

  deleteItem(cartItemId) {
    const itemToRemoveIndex = this.cartItems.findIndex(item => item.id === cartItemId)
    if (itemToRemoveIndex > -1) {
      this.cartItems.splice(itemToRemoveIndex, 1)
      this.initCartElements()
    }
  }

  deleteItems() {
    this.cartItems = []
    this.initCartElements()
  }

  async checkoutOrder() {
    try {
      await createOrder(this.cartItems)
      this.init()
      toggleCartPopups()
      createNotification("Order completed successfully", "success")
    } catch (error) {
      console.error(error)
      createNotification("Failed to checkout order", "error")
    }
  }
}

const cart =  new Cart()
// #endregion

// Page
const loginButtonEl = document.querySelector("#login-button")
const cartButtonEl = document.querySelector("#cart-button")
const cartContainerEl = document.querySelector(".cart-container")
const cartContainerOverlayEl = document.querySelector(".cart-container-overlay")
const bodyEl = document.querySelector("body")
const seeAllRecipesButtonEl = document.querySelector(".see-all-recipes")
const additionalMealsExamples = document.querySelectorAll('.meal-extra')
const sectionMealsContainer = document.querySelector('.section-meals-container')
const addMealToCartButtons = document.querySelectorAll('.add-to-cart-button')

const userToken = localStorage.getItem('token')

loginButtonEl.textContent = userToken ? "Sign out" : "Login"

loginButtonEl.addEventListener('click', e => {
  e.preventDefault();
  if (userToken) {
    localStorage.removeItem('token') // Log-Out
    window.location.reload()
    return
  }
   window.open('/login.html', "_self")
})

seeAllRecipesButtonEl.addEventListener('click', e => {
  e.preventDefault();
  const buttonValue = seeAllRecipesButtonEl.textContent
  if (buttonValue === 'See Less') {
    seeAllRecipesButtonEl.textContent = 'See All Recipes'
  } else {
     seeAllRecipesButtonEl.textContent = 'See Less'
  }
  additionalMealsExamples.forEach(el => {
    el.classList.toggle('hidden')
  })
})

// Will be added in db
// const mealsList = (async () => {
//   const { items } = await getMeals()
//   return { items }
// })()

addMealToCartButtons.forEach(btn => {
  btn.addEventListener('click',async  e => {
    e.preventDefault();
    const node = e.target
    const mealEl = node.closest('.meal')
    const mealId = mealEl.dataset.mealId
    const mealToAddToCart = await getMealById(mealId)
    createNotification('Meal has been added to cart', 'success')
    if (!mealToAddToCart) return
    cart.addItemToCart(mealToAddToCart)
  })
})

const preventScrolling = () => bodyEl.style.overflow = 'hidden';
const allowScrolling = () => bodyEl.style.overflow = 'unset';

function toggleCartPopups() {
  console.log('hiddren')
  cartContainerEl.classList.toggle('hidden')
  cartContainerOverlayEl.classList.toggle('hidden')
}

const onCartButtonClick = e => {
  e.preventDefault();
  toggleCartPopups()
  cart.init()
  preventScrolling()
}

const onCartOverlayClick = e => {
  e.preventDefault();
  toggleCartPopups()
  allowScrolling()
}

cartButtonEl.addEventListener('click', onCartButtonClick)
cartContainerOverlayEl.addEventListener('click', onCartOverlayClick)

const signupForm = document.querySelector('.sign-up-form')
const firstNameInput = document.querySelector('#first-name')
const lastNameInput = document.querySelector('#last-name')
const emailInput = document.querySelector('#email')
const pswdInput = document.querySelector('#password')
const toasts = document.getElementById('toasts')
const types = ['info', 'success', 'error']

function createNotification(message, type = 'info') {
    const notify = document.createElement('div')
    notify.classList.add('toast')
    notify.classList.add(type)
    notify.innerText = message
    toasts.appendChild(notify)
    setTimeout(() => {
        notify.remove()
    }, 3000)
}

const resetInputs = () => {
    firstNameInput.value = ''
    lastNameInput.value = ''
    pswdInput.value = ''
    emailInput.value = ''
}

const onSubmit = async e => {
    e.preventDefault()
    if (firstNameInput.value === '' || lastNameInput.value === ''|| emailInput.value === '' || pswdInput.value === '') {
        createNotification('Please insert all fields','error')
        return
    }
    if (pswdInput.value.length<8){
        createNotification('Password must be at least 8 digits','error')
        return
    }

    if(!isNaN(firstNameInput.value) || !isNaN(lastNameInput.value)){
        createNotification('A name can not contain numbers','error')
        return
    }

    const newUser = {
      email: emailInput.value,
      password: pswdInput.value,
      firstName: firstNameInput.value,
      lastName:lastNameInput.value
    }
    
    try {
        await signup(newUser)
        createNotification('The user has been created, you can login now', 'success')
        resetInputs()
    } catch (error) {
      console.error('Failed to signup', error)
      const message = error.code === 'EMAIL_ALREADY_EXISTS' ? 'Pleae choose another email' :  'Failed to signup user'
      createNotification(message, 'error')
    }
}

signupForm.addEventListener('submit', onSubmit )

