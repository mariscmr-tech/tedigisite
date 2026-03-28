let currentProduct = null;

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.getElementById('product-detail-wrapper').innerHTML = "<h3 style='text-align:center; padding: 100px;'>❌ Không tìm thấy sản phẩm!</h3>";
        return;
    }

    // Tải dữ liệu từ Cache (tốc độ ánh sáng)
    const cachedProducts = sessionStorage.getItem('tedigi_public_products');
    if (cachedProducts) {
        renderModernUI(JSON.parse(cachedProducts), productId);
    }

    // Xác minh lại với Server ngầm
    if (typeof SCRIPT_URL !== 'undefined') {
        fetch(SCRIPT_URL).then(res => res.json()).then(data => {
            sessionStorage.setItem('tedigi_public_products', JSON.stringify(data));
            renderModernUI(data, productId);
        }).catch(err => console.log(err));
    }
});

function renderModernUI(data, productName) {
    const item = data.find(p => p.name === productName);
    if (!item) return;

    currentProduct = item;
    const stockAmount = parseInt(item.stock) || 0;
    const formattedPrice = parseInt(item.price).toLocaleString('vi-VN');
    
    // 1. XỬ LÝ ẢNH GALLERY
    let images = ["https://dummyimage.com/600x600/ccc/fff&text=Lỗi+ảnh"];
    if (item.image) {
        images = String(item.image).split(',').map(img => img.trim()).filter(img => img !== "");
        if(images.length === 0) images = ["https://dummyimage.com/600x600/ccc/fff&text=Lỗi+ảnh"];
    }
    
    let thumbHtml = '';
    if (images.length > 1) {
        images.forEach((img, idx) => {
            thumbHtml += `<div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="changeImg(this, '${img}')">
                            <img src="${img}" onerror="this.src='https://dummyimage.com/80/ff4d4d/fff&text=Lỗi'">
                          </div>`;
        });
    }

    // 2. XỬ LÝ THÔNG SỐ (Tạo dạng bảng nếu nhập kiểu Dòng 1 \n Dòng 2)
    let specsHtml = item.specs || 'Chưa có thông số kỹ thuật.';
    if (item.specs && item.specs.includes(':')) {
        // Nếu bạn nhập Excel kiểu "CPU: Intel \n RAM: 8GB", code sẽ tự biến thành bảng HTML siêu đẹp
        let lines = item.specs.split('\n');
        specsHtml = `<table class="specs-table"><tbody>`;
        lines.forEach(line => {
            if(line.includes(':')) {
                let parts = line.split(':');
                specsHtml += `<tr><td>${parts[0].trim()}</td><td>${parts.slice(1).join(':').trim()}</td></tr>`;
            } else if(line.trim() !== '') {
                specsHtml += `<tr><td colspan="2">${line.trim()}</td></tr>`;
            }
        });
        specsHtml += `</tbody></table>`;
    }

    // 3. RENDER BỘ KHUNG GIAO DIỆN
    const html = `
        <div class="breadcrumb">
            <a href="index.html">Trang chủ</a> > <a href="products.html?cat=all">Sản phẩm</a> > <b>${item.name}</b>
        </div>

        <div class="container">
            <div class="product-main">
                <div class="product-gallery">
                    <div class="main-img-view">
                        <img id="main-product-img" src="${images[0]}" alt="${item.name}">
                    </div>
                    <div class="thumb-list">${thumbHtml}</div>
                </div>

                <div class="product-info">
                    <h1 class="p-title">${item.name}</h1>
                    <div class="p-meta">
                        <span>Mã SP: <b>${item.code || 'Đang cập nhật'}</b></span>
                        <span>Danh mục: <b>${item.category || 'Khác'}</b></span>
                        <span>Tình trạng: ${stockAmount > 0 ? `<span class="status-in">Còn hàng (${stockAmount})</span>` : `<span class="status-out">Hết hàng</span>`}</span>
                    </div>

                    <div class="p-price-box">
                        <p class="p-price">${formattedPrice} ₫</p>
                    </div>

                    <div class="p-short-desc">
                        ${item.desc ? item.desc.replace(/\n/g, '<br>') : 'Sản phẩm chính hãng phân phối bởi TedigiVN.'}
                    </div>

                    ${stockAmount > 0 ? `
                        <div class="buy-action-box">
                            <div class="qty-row">
                                <span class="qty-title">Số lượng:</span>
                                <div class="qty-selector">
                                    <button class="qty-btn" onclick="changeQty(-1)">-</button>
                                    <input type="text" id="p-qty" class="qty-input" value="1" readonly>
                                    <button class="qty-btn" onclick="changeQty(1)">+</button>
                                </div>
                            </div>
                            <div class="btn-group">
                                <button class="btn-add-cart" onclick="addAndGoCart(false)">THÊM VÀO GIỎ</button>
                                <button class="btn-buy-now" onclick="addAndGoCart(true)">MUA NGAY</button>
                            </div>
                        </div>
                    ` : `
                        <div class="buy-action-box">
                            <button class="btn-buy-now" style="background: #888; cursor: not-allowed; box-shadow: none;" disabled>SẢN PHẨM TẠM HẾT HÀNG</button>
                        </div>
                    `}

                    <div class="policy-box">
                        <div class="policy-item"><span>✅ <b>Bảo hành chính hãng:</b> 12-24 tháng</span></div>
                        <div class="policy-item"><span>🔄 <b>Đổi trả:</b> Lỗi 1 đổi 1 trong 7 ngày</span></div>
                        <div class="policy-item"><span>🚚 <b>Giao hàng:</b> Miễn phí nội thành</span></div>
                        <div class="policy-item"><span>🎧 <b>Hỗ trợ kỹ thuật:</b> 24/7 trọn đời máy</span></div>
                    </div>
                </div>
            </div>

            <div class="product-tabs-section">
                <div class="tab-header">
                    <div class="tab-btn active" onclick="switchTab('tab-desc', this)">MÔ TẢ SẢN PHẨM</div>
                    <div class="tab-btn" onclick="switchTab('tab-specs', this)">THÔNG SỐ KỸ THUẬT</div>
                </div>
                
                <div id="tab-desc" class="tab-content active">
                    <p>Đang cập nhật bài viết chi tiết cho sản phẩm <b>${item.name}</b>...</p>
                    <p>Sản phẩm này mang lại giải pháp bán hàng tối ưu, thiết kế sang trọng, phù hợp cho nhà hàng, siêu thị, quán cafe.</p>
                </div>
                
                <div id="tab-specs" class="tab-content">
                    ${specsHtml}
                </div>
            </div>
        </div>
    `;

    document.getElementById('product-detail-wrapper').innerHTML = html;
    document.title = item.name + " - TedigiVN";
}

// Hàm đổi ảnh Gallery
function changeImg(element, src) {
    document.getElementById('main-product-img').src = src;
    document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
}

// Hàm Chuyển Tabs
function switchTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
}

// Hàm Tăng giảm số lượng
function changeQty(change) {
    let input = document.getElementById('p-qty');
    let newVal = parseInt(input.value) + change;
    let max = parseInt(currentProduct.stock);
    if (newVal >= 1 && newVal <= max) input.value = newVal;
}

// Hàm Thêm giỏ hàng (Có nút Mua Ngay chuyển thẳng tới giỏ)
function addAndGoCart(goToCart) {
    let qty = parseInt(document.getElementById('p-qty').value);
    let cart = JSON.parse(localStorage.getItem('tedigi_cart')) || [];
    let existingItem = cart.find(item => item.name === currentProduct.name);
    let maxStock = parseInt(currentProduct.stock);

    if (existingItem) {
        if (existingItem.quantity + qty > maxStock) {
            alert("Vượt quá số lượng tồn kho!"); return;
        }
        existingItem.quantity += qty;
    } else {
        cart.push({ name: currentProduct.name, price: currentProduct.price, image: String(currentProduct.image).split(',')[0], quantity: qty });
    }

    localStorage.setItem('tedigi_cart', JSON.stringify(cart));
    updateCartBadge();
    
    if (goToCart) {
        window.location.href = 'cart.html';
    } else {
        alert("✅ Đã thêm vào giỏ hàng!");
    }
}