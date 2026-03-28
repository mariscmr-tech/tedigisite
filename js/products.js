// === 1. XÁC ĐỊNH DANH MỤC ===
const urlParams = new URLSearchParams(window.location.search);
const catParam = urlParams.get('cat') || 'all';
const catMap = {
    'pos': 'Máy POS bán hàng', 'bill': 'Máy in bill', 'scan': 'Máy quét mã vạch',
    'print': 'Máy in công nghiệp', 'cashdrawer': 'Ngăn kéo đựng tiền', 'all': 'Tất cả sản phẩm'
};
const targetCategory = catMap[catParam] || 'Tất cả sản phẩm';

document.getElementById('category-title').innerText = targetCategory;
const activeLink = document.getElementById('link-' + catParam);
if(activeLink) activeLink.classList.add('active');

// === 2. VẼ GIAO DIỆN LƯỚI SẢN PHẨM ===
function renderProductsUI(data) {
    document.getElementById('loading').style.display = 'none'; 
    const container = document.getElementById('product-container');
    container.innerHTML = ""; let count = 0;

    data.forEach(item => {
        if (!item.name || String(item.name).trim() === "" || !item.price) return;
        const cleanCat = item.category ? String(item.category).trim() : "";
        
        if (targetCategory === 'Tất cả sản phẩm' || cleanCat === targetCategory) {
            count++;
            const formattedPrice = parseInt(item.price).toLocaleString('vi-VN');
            
            // Xử lý lấy ảnh đầu tiên (nếu có nhiều ảnh ghép bằng dấu phẩy)
            const safeImage = item.image ? String(item.image).split(',')[0].trim() : "https://dummyimage.com/300x200/ccc/fff&text=Lỗi+ảnh";
            
            const stockAmount = parseInt(item.stock) || 0;
            let buttonHTML = '', badgeHTML = '', promoHTML = '';

            // Render Tem và Nút mua
            if (stockAmount <= 0) {
                badgeHTML = `<span class="badge-outstock">Hết hàng</span>`;
                buttonHTML = `<button class="out-stock-btn" disabled>Hết hàng</button>`;
            } else {
                buttonHTML = `<button class="buy-btn" onclick="openQtyModal('${item.name.replace(/'/g, "\\'")}', ${item.price}, '${safeImage}', ${stockAmount})">Thêm vào giỏ</button>`;
            }
            
            const descText = item.desc ? String(item.desc).toLowerCase() : '';
            if (descText.includes('sale') || descText.includes('giảm')) promoHTML = `<span class="badge-promo">🔥 Đang Sale</span>`;

            // ĐƯỜNG DẪN CHUẨN SANG TRANG CHI TIẾT
            const detailUrl = `detail.html?id=${encodeURIComponent(item.name)}`;

            // Đổ HTML ra màn hình (Chú ý phân tách rõ thẻ <a> và thẻ <button>)
            container.innerHTML += `
                <div class="product-card">
                    ${badgeHTML}${promoHTML}
                    
                    <a href="${detailUrl}" style="text-decoration: none; color: inherit; display: block; cursor: pointer;">
                        <img src="${safeImage}" alt="${item.name}" onerror="this.src='https://dummyimage.com/300x200/ff4d4d/ffffff&text=Lỗi+ảnh'">
                        <div class="product-info">
                            <h3>${item.name}</h3>
                            <p class="price">${formattedPrice} đ</p>
                        </div>
                    </a>
                    
                    ${buttonHTML}
                </div>`;
        }
    });
    
    document.getElementById('product-count').innerText = `Hiển thị ${count} sản phẩm`;
    if (count === 0) container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #888; padding: 30px;">Chưa có sản phẩm nào trong danh mục này.</p>`;
}

// === 3. TẢI DỮ LIỆU BÓNG MA (CACHE) ===
const cachedProducts = sessionStorage.getItem('tedigi_public_products');
if (cachedProducts) renderProductsUI(JSON.parse(cachedProducts));

if (typeof SCRIPT_URL !== 'undefined') {
    fetch(SCRIPT_URL).then(res => res.json()).then(data => {
        sessionStorage.setItem('tedigi_public_products', JSON.stringify(data));
        renderProductsUI(data); 
    }).catch(err => { 
        if (!cachedProducts) document.getElementById('loading').innerHTML = `<span style="color:red;">❌ Lỗi kết nối mạng.</span>`; 
    });
}

// === 4. XỬ LÝ POP-UP GIỎ HÀNG ===
let selectedProduct = {};

function openQtyModal(name, price, img, stock) {
    selectedProduct = { name: name, price: price, image: img, maxStock: stock };
    document.getElementById('m-img').src = img; 
    document.getElementById('m-title').innerText = name;
    document.getElementById('m-price').innerText = parseInt(price).toLocaleString('vi-VN') + ' đ';
    document.getElementById('m-stock').innerText = stock; 
    document.getElementById('m-qty').value = 1;
    document.getElementById('qtyModal').style.display = 'flex';
}

function closeQtyModal() { document.getElementById('qtyModal').style.display = 'none'; }

function changeQty(change) {
    let input = document.getElementById('m-qty'); 
    let newVal = parseInt(input.value) + change;
    if (newVal >= 1 && newVal <= selectedProduct.maxStock) input.value = newVal;
}

function confirmAddToCart() {
    let qty = parseInt(document.getElementById('m-qty').value);
    let cart = JSON.parse(localStorage.getItem('tedigi_cart')) || [];
    let existingItem = cart.find(item => item.name === selectedProduct.name);
    
    if (existingItem) {
        if (existingItem.quantity + qty > selectedProduct.maxStock) { alert("❌ Vượt quá số lượng tồn kho!"); return; }
        existingItem.quantity += qty;
    } else {
        cart.push({ name: selectedProduct.name, price: selectedProduct.price, image: selectedProduct.image, quantity: qty });
    }
    
    localStorage.setItem('tedigi_cart', JSON.stringify(cart));
    
    // Gọi hàm đếm giỏ hàng từ file main.js
    if (typeof updateCartBadge === 'function') updateCartBadge(); 
    
    closeQtyModal();
    alert("✅ Đã thêm sản phẩm vào giỏ hàng thành công!");
}