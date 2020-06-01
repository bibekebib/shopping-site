// All sorts of Variable needed for the project
const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverLay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products-center')

// cart

let cart = []

// buttons
let buttonsDOM = ''

// getting the products

class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json')
      let data = await result.json()
      let products = data.items
      products = products.map((item) => {
        const { title, price } = item.fields
        const { id } = item.sys
        const image = item.fields.image.fields.file.url
        return { title, price, id, image }
      })
      return products
    } catch (error) {
      console.log(error)
    }
  }
}

// display products

class UI {
  displayProducts(products) {
    let result = ''
    products.forEach((product) => {
      result += ` <!-- Product No.1 -->
      <article class="product">
        <div class="img-container">
          <img src=${product.image} height="270px"
          width="270px">
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      <!-- End of Product No. 1 -->`
    })
    productsDOM.innerHTML = result
  }

  getBagBtn() {
    const buttons = [...document.querySelectorAll('.bag-btn')]
    buttonsDOM = buttons
    buttons.forEach((button) => {
      let id = button.dataset.id
      let inCart = cart.find((item) => item.id === id)
      if (inCart) {
        button.innerHTML = 'In Cart'
        button.disabled = true
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = 'In Cart'
        event.target.disabled = true
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 }
        // console.log(cartItem)

        // add product in local Storage
        cart = [...cart, cartItem]
        // console.log(cart)
        // save cart in local storage
        Storage.saveCart(cart)
        // set cart values
        this.setCartValues(cart)

        // dispaly cart items
        this.addCartItem(cartItem)
        // show the cart
        this.showCart()
      })
    })
  }
  setCartValues(cart) {
    let tempTotal = 0
    let itemsTotal = 0
    cart.map((item) => {
      tempTotal += item.price * item.amount
      itemsTotal += item.amount
    })
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
    cartItems.innerText = itemsTotal
  }
  addCartItem(item) {
    to_server(item);
    const div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = `
    <img src=${item.image} alt="lehenga" />
            <div class="">
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>Remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`
    cartContent.appendChild(div)
    // console.log(cartContent)
  }

  showCart() {
    cartOverLay.classList.add('trasnparentBcg')
    cartDOM.classList.add('showCart')
  }
  hideCart() {
    cartOverLay.classList.remove('trasnparentBcg')
    cartDOM.classList.remove('showCart')
  }
  setupAPP() {
    cart = Storage.getCart()
    this.setCartValues(cart)
    this.populate(cart)
    cartBtn.addEventListener('click', this.showCart)
    closeCartBtn.addEventListener('click', this.hideCart)
  }
  populate(cart) {
    cart.forEach((item) => this.addCartItem(item))
  }

  cartLogic() {
    // celar cart button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart()
    })
    // cart functinality
    cartContent.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target
        let id = removeItem.dataset.id
        cartContent.removeChild(removeItem.parentElement.parentElement)
        this.removeItem(id)
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target
        let id = addAmount.dataset.id
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount + 1
        Storage.saveCart(cart)
        this.setCartValues(cart)
        addAmount.nextElementSibling.innerText = tempItem.amount
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target
        let id = lowerAmount.dataset.id
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount - 1
        if (tempItem.amount > 0) {
          Storage.saveCart(cart)
          this.setCartValues(cart)
          lowerAmount.previousElementSibling.innerText = tempItem.amount
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement)
          this.removeItem(id)
        }
      }
    })
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id)
    cartItems.forEach((id) => this.removeItem(id))
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart()
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id)
    this.setCartValues(cart)
    Storage.saveCart(cart)
    let button = this.getSingleButton(id)
    button.disabled = false
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>
    Add to Cart`
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id)
  }
}

// localStorage

class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products))
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'))
    return products.find((product) => product.id === id)
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : []
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI()
  const products = new Products()

  // setup app
  ui.setupAPP()

  //   get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products)
      Storage.saveProducts(products)
    })
    .then(() => {
      ui.getBagBtn()
      ui.cartLogic()
    })
})

function makeRequest(method, url) {
  var request = new XMLHttpRequest();
  if ("withCredentials" in request) {
      request.open(method, url, true);
  } 
  else if (typeof XDomainRequest != "undefined") {
      request = new XDomainRequest();
      request.open(method, url);
  } else {
      request = null;
  }
  return request;
}


function to_server(arg){
  var request = makeRequest("GET", "api/main.php?shop="+arg.id);
  if(!request) {
      console.log('Request not supported');
      return;
  }
  request.onreadystatechange = () => {
      if(request.readyState==4&&request.status==200){
          alert(request.responseText);

      }
      else if(request.readyState==4&&request.status!=200){
          console.log("Error occured!!!");
      }
  };
  request.send();
}

