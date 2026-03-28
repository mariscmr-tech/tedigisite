let cart = JSON.parse(localStorage.getItem('tedigi_cart')) || [];
let totalAmount = 0;

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    let totalQty = 0; totalAmount = 0; container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-msg"><div style="font-size: 3em; margin-bottom: 10px;">🛒</div>Giỏ hàng của bạn đang trống.<br><a href="products.html?cat=all" style="color: #1a73e8; font-weight: bold; display: inline-block; margin-top: 15px;">Đi mua sắm ngay →</a></div>`;
        document.getElementById('checkoutSection').style.display = 'none'; return;
    }

    document.getElementById('checkoutSection').style.display = 'block';
    cart.forEach((item, index) => {
        totalQty += item.quantity;
        totalAmount += item.price * item.quantity;
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" class="cart-img" onerror="this.src='https://dummyimage.com/80/ff4d4d/ffffff&text=Lỗi'">
                <div class="item-info"><div class="item-name">${item.name}</div><div class="item-price">${parseInt(item.price).toLocaleString('vi-VN')} đ</div></div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                    <input type="text" class="qty-input" value="${item.quantity}" readonly>
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                </div>
                <button class="btn-remove" onclick="removeItem(${index})">Xóa</button>
            </div>`;
    });
    document.getElementById('totalAmountDisplay').innerText = parseInt(totalAmount).toLocaleString('vi-VN') + " đ";
}

function changeQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        if(confirm("Bạn muốn xóa sản phẩm này khỏi giỏ?")) cart.splice(index, 1);
        else cart[index].quantity = 1;
    }
    localStorage.setItem('tedigi_cart', JSON.stringify(cart)); renderCart(); updateCartBadge();
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('tedigi_cart', JSON.stringify(cart)); renderCart(); updateCartBadge();
}

document.addEventListener("DOMContentLoaded", renderCart);

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitOrderBtn'); const statusMsg = document.getElementById('orderStatus');
    if (cart.length === 0) { alert("Giỏ hàng trống!"); return; }
    btn.disabled = true; btn.innerText = "ĐANG XỬ LÝ..."; statusMsg.innerText = "";

    const payload = {
        action: 'place_order', customerName: document.getElementById('cName').value.trim(),
        phone: document.getElementById('cPhone').value.trim(), address: document.getElementById('cAddress').value.trim(),
        cart: cart, totalAmount: totalAmount
    };

    fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
    .then(res => res.json()).then(data => {
        if (data.status === "success") {
            localStorage.removeItem('tedigi_cart'); cart = []; renderCart(); updateCartBadge();
            document.getElementById('orderCodeDisplay').innerText = data.message.replace("Mã đơn: ", "");
            document.getElementById('successModal').style.display = 'flex';
        } else { statusMsg.innerText = "Lỗi: " + data.message; statusMsg.style.color = "red"; }
    }).catch(error => { statusMsg.innerText = "Lỗi mạng!"; statusMsg.style.color = "red"; })
    .finally(() => { btn.disabled = false; btn.innerText = "XÁC NHẬN ĐẶT HÀNG"; });
});