// ——— Telegram WebApp obyekti (bo'lsa) ———
const tg = window.Telegram && Telegram.WebApp ? Telegram.WebApp : null;

// ——— Mahsulotlarni JSON fayldan yuklab, catalog'ga joylash ———
const catalogEl = document.getElementById("catalog");
let products = [];
let cart = [];

fetch("products.json")
  .then(res => res.json())
  .then(data => {
    products = data;
    renderCatalog();
  });

function renderCatalog(){
  catalogEl.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="info">
        <h3>${p.name}</h3>
        <p>${p.price.toLocaleString()} so‘m</p>
        <button onclick="addToCart(${p.id})">Savatga qo‘shish</button>
      </div>
    `;
    catalogEl.appendChild(card);
  });
}

// ——— Savat funksiyalari ———
function addToCart(id){
  const item = products.find(p=>p.id===id);
  const existing = cart.find(c=>c.id===id);
  if(existing){
    existing.qty += 1;
  }else{
    cart.push({...item, qty:1});
  }
  renderCart();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function renderCart(){
  const cartItemsEl = document.getElementById("cartItems");
  cartItemsEl.innerHTML = "";
  let total = 0;

  cart.forEach(i => {
    total += i.price * i.qty;
    const div = document.createElement("div");
    div.className = "cartItem";
    div.innerHTML = `
      <span>${i.name} × ${i.qty}</span>
      <span>
        ${(i.price*i.qty).toLocaleString()} so‘m
        <button style="margin-left:8px" onclick="removeFromCart(${i.id})">✖️</button>
      </span>
    `;
    cartItemsEl.appendChild(div);
  });

  document.getElementById("total").innerText = `Jami: ${total.toLocaleString()} so‘m`;
}

// ——— Buyurtmani Telegram botga yuborish ———
document.getElementById("sendOrder").addEventListener("click", ()=>{
  if(cart.length === 0){
    alert("Savat bo'sh!");
    return;
  }
  const orderText = cart.map(i => `${i.name} × ${i.qty} — ${(i.price*i.qty).toLocaleString()} so‘m`)
                        .join("\n");
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString();
  const message = `🛍️ Yangi buyurtma:\n${orderText}\n\nJami: ${total} so‘m`;

  if(tg){
    tg.sendData(message);   // botga yuborish
    tg.close();             // sahifani yopish
  }else{
    alert("Telegram WebApp aniqlanmadi:\n\n" + message);
  }
});
