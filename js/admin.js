// ==========================================
// 1. KHỞI TẠO & PHÂN QUYỀN (Không khai báo lại biến từ main.js)
// ==========================================
function initAdminSystem() {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('displayName') || "Nhân viên";
    const roleNames = { 'admin': 'Quản trị viên', 'warehouse': 'Thủ Kho', 'sale': 'Kinh Doanh', 'shipper': 'Giao Hàng' };

    // Hiển thị tên lên Header
    const nameHeader = document.getElementById('display-name-header');
    if (nameHeader) {
        nameHeader.innerText = `${name} (${roleNames[role] || 'Thành viên'})`;
    }

    // Phân quyền hiển thị Tab
    const btnAdd = document.getElementById('btn-add-tab');
    const btnManage = document.getElementById('btn-manage-tab');
    const btnOrder = document.getElementById('btn-order-tab');

    if (btnAdd && btnManage && btnOrder) {
        if (role === 'admin') {
            btnAdd.style.display = btnManage.style.display = btnOrder.style.display = 'block';
            loadAllProducts(); loadAllOrders();
        } else if (role === 'warehouse') {
            btnAdd.style.display = btnManage.style.display = 'block';
            loadAllProducts();
        } else {
            btnOrder.style.display = 'block';
            switchTab('order-tab'); loadAllOrders();
        }
    }
}

// ==========================================
// 2. QUẢN LÝ SẢN PHẨM & BỘ LỌC TÌM KIẾM
// ==========================================
let allProductsData = []; // Lưu trữ dữ liệu gốc để lọc

function loadAllProducts() {
    fetch(SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'get_all_products', role: localStorage.getItem('userRole') }) 
    })
    .then(res => res.json())
    .then(data => {
        allProductsData = data;
        renderProductList(data);
    })
    .catch(err => console.error("Lỗi tải sản phẩm:", err));
}

// HÀM TÌM KIẾM SẢN PHẨM (Mới thêm)
function filterProducts() {
    const searchTerm = document.getElementById('searchProductInput').value.toLowerCase();
    const filtered = allProductsData.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        (item.code && item.code.toLowerCase().includes(searchTerm))
    );
    renderProductList(filtered);
}

function renderProductList(data) {
    const listEl = document.getElementById('product-list');
    const countEl = document.getElementById('product-count');
    if (!listEl) return;
    countEl.innerText = data.length;

    listEl.innerHTML = data.map(item => {
        const safeImg = item.image ? String(item.image).split(',')[0].trim() : "images/logo.png";
        const stockColor = item.stock <= 5 ? "#D61A3C" : "#1E5BB1";

        return `
            <div class="pending-item" style="border-left: 5px solid ${stockColor};">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${safeImg}" style="width: 50px; height: 50px; border-radius: 4px;" onerror="this.src='images/logo.png'">
                    <div>
                        <b style="color: #1E5BB1;">${item.name}</b><br>
                        <span style="font-size: 12px;">Mã: ${item.code || 'N/A'} | Giá: <b style="color: #D61A3C;">${parseInt(item.price).toLocaleString('vi-VN')} đ</b></span>
                    </div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="prepareEdit('${item.name.replace(/'/g, "\\'")}')" class="btn-edit">Sửa</button>
                </div>
            </div>`;
    }).join('');
}

// ==========================================
// 3. QUẢN LÝ ĐƠN HÀNG & BỘ LỌC
// ==========================================
let allOrdersData = [];

function loadAllOrders() {
    fetch(SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'get_all_orders', role: localStorage.getItem('userRole') }) 
    })
    .then(res => res.json())
    .then(data => {
        allOrdersData = data;
        renderOrderList(data);
    });
}

// HÀM TÌM KIẾM ĐƠN HÀNG (Mới thêm)
function filterOrders() {
    const searchTerm = document.getElementById('searchOrderInput').value.toLowerCase();
    const filtered = allOrdersData.filter(item => 
        item.customerName.toLowerCase().includes(searchTerm) || 
        item.phone.includes(searchTerm) ||
        item.orderId.toLowerCase().includes(searchTerm)
    );
    renderOrderList(filtered);
}

function renderOrderList(data) {
    const listEl = document.getElementById('order-list');
    const countEl = document.getElementById('order-count');
    if (!listEl) return;
    countEl.innerText = data.length;

    listEl.innerHTML = data.map(item => `
        <div class="pending-item" style="display: block;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; margin-bottom: 10px;">
                <b style="color: #1E5BB1;">${item.orderId}</b>
                <span style="color: #D61A3C; font-weight: bold;">${parseInt(item.total).toLocaleString('vi-VN')} đ</span>
            </div>
            <div style="font-size: 13px;">
                👤 ${item.customerName} - 📞 ${item.phone}<br>
                📦 ${item.details}
            </div>
        </div>
    `).join('');
}

// ==========================================
// 4. TIỆN ÍCH CHUNG
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    const btn = document.getElementById('btn-' + tabId);
    if (btn) btn.classList.add('active');
}

// ==========================================
// BỔ SUNG: XỬ LÝ GIAO DIỆN DÒNG NHẬP LIỆU ĐỘNG
// ==========================================

// Hàm thêm dòng nhập Link ảnh
function addImageRow(val = '') {
    const container = document.getElementById('image-container');
    if (!container) return;
    
    const div = document.createElement('div'); 
    div.className = 'dynamic-input-row';
    div.style.display = 'flex';
    div.style.gap = '5px';
    div.style.marginBottom = '5px';
    
    div.innerHTML = `
        <input type="url" class="pImageInput" placeholder="Nhập link ảnh..." value="${val}" required style="flex-grow: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">❌</button>
    `;
    container.appendChild(div);
}

// Hàm thêm dòng nhập Thông số kỹ thuật
function addSpecRow(name = '', val = '') {
    const container = document.getElementById('specs-container');
    if (!container) return;

    const div = document.createElement('div'); 
    div.className = 'dynamic-input-row';
    div.style.display = 'flex';
    div.style.gap = '5px';
    div.style.marginBottom = '5px';

    div.innerHTML = `
        <input type="text" class="pSpecName" placeholder="Tên thông số (VD: CPU)" value="${name}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <input type="text" class="pSpecValue" placeholder="Giá trị (VD: Core i3)" value="${val}" style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">❌</button>
    `;
    container.appendChild(div);
}

// Hàm dọn dẹp form về trạng thái ban đầu
function resetDynamicForms() {
    const imgCont = document.getElementById('image-container');
    const specCont = document.getElementById('specs-container');
    if (imgCont) { imgCont.innerHTML = ''; addImageRow(); }
    if (specCont) { specCont.innerHTML = ''; addSpecRow(); }
}

function prepareEdit(name) {
    const p = allProductsData.find(item => item.name === name);
    if (!p) return;

    isEditing = true;
    oldEditName = p.name;

    document.getElementById('pName').value = p.name;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pCode').value = p.code || '';
    document.getElementById('pStock').value = p.stock || 0;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pDesc').value = (p.desc || "").replace(/\\n/g, '\n');

    // XỬ LÝ ẢNH: Tách chuỗi ảnh thành các dòng input
    document.getElementById('image-container').innerHTML = '';
    const imgArr = p.image ? String(p.image).split(',') : [];
    if (imgArr.length > 0) {
        imgArr.forEach(img => addImageRow(img.trim()));
    } else {
        addImageRow();
    }

    // XỬ LÝ THÔNG SỐ: Tách chuỗi specs thành các dòng input
    document.getElementById('specs-container').innerHTML = '';
    const specArr = p.specs ? String(p.specs).split('\n') : [];
    if (specArr.length > 0 && specArr[0] !== '') {
        specArr.forEach(s => {
            if(s.includes(':')) { 
                const parts = s.split(':'); 
                addSpecRow(parts[0].trim(), parts.slice(1).join(':').trim()); 
            }
        });
    } else { 
        addSpecRow(); 
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('addBtn').innerText = "CẬP NHẬT SẢN PHẨM";
    document.getElementById('cancelEditBtn').style.display = "inline-block";
    switchTab('add-tab');
}

// Khởi chạy hệ thống
document.addEventListener('DOMContentLoaded', initAdminSystem);