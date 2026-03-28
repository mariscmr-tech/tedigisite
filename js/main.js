// ==========================================
// 1. BIẾN TOÀN CỤC & CẤU HÌNH
// ==========================================
const isLoggedIn = localStorage.getItem('isLoggedIn');
const userRole = localStorage.getItem('userRole');
const displayName = localStorage.getItem('displayName') || "Thành viên";

// ==========================================
// 2. HÀM NẠP HEADER & FOOTER TỰ ĐỘNG
// ==========================================
async function includeHTML() {
    const elements = {
        'header-placeholder': 'includes/header.html',
        'footer-placeholder': 'includes/footer.html'
    };

    for (const [id, path] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`Không thể nạp file: ${path}`);
                const html = await response.text();
                el.innerHTML = html;
                
                // Sau khi nạp Header xong, chạy các logic phụ thuộc
                if (id === 'header-placeholder') {
                    setupUserMenu();     // Hiển thị nút Admin/Thoát
                    updateCartBadge();   // Cập nhật số lượng giỏ hàng
                    setupSecretLogin();  // Kích hoạt cổng đăng nhập bí mật
                }
            } catch (err) {
                console.error("Lỗi includeHTML:", err);
            }
        }
    }
}

// ==========================================
// 3. TÍNH NĂNG CLICK 5 LẦN VÀO HEADER ĐỂ ĐĂNG NHẬP
// ==========================================
function setupSecretLogin() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    let clickCount = 0;
    let clickTimer;

    // Lắng nghe sự kiện click trên toàn bộ vùng Header
    headerPlaceholder.addEventListener('click', (e) => {
        // Nếu đã đăng nhập rồi thì không cần kích hoạt cổng bí mật
        if (isLoggedIn === "true") return;

        // Bỏ qua nếu click vào các nút bấm hoặc link (để tránh làm phiền trải nghiệm thường)
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
            return;
        }

        clickCount++;
        
        // Hiển thị log nhẹ trong Console để bạn kiểm tra (có thể xóa khi chạy thật)
        console.log(`Secret click: ${clickCount}/5`);

        if (clickCount >= 5) {
            window.location.href = 'login.html';
        }

        // Tự động reset bộ đếm nếu người dùng ngừng click quá 1.5 giây
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 1500);
    });
}

// ==========================================
// 4. QUẢN LÝ MENU NGƯỜI DÙNG & GIỎ HÀNG
// ==========================================
function setupUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (!userMenu) return;

    if (isLoggedIn === "true") {
        // Hiển thị tên và nút quản trị nếu đã đăng nhập
        userMenu.innerHTML = `
            <div class="user-logged-in" style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 13px; color: #333;">Hi, <b>${displayName}</b></span>
                <button onclick="window.location.href='admin.html'" style="padding: 6px 12px; background: #1E5BB1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Quản trị</button>
                <button onclick="logout()" style="padding: 6px 12px; background: #D61A3C; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Thoát</button>
            </div>
        `;
    } else {
        // Nếu chưa đăng nhập, bạn có thể để trống hoặc hiện nút "Liên hệ"
        userMenu.innerHTML = `<span style="font-size: 12px; color: #888;">Hotline: 1900 xxxx</span>`;
    }
}

function updateCartBadge() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;
    
    const cart = JSON.parse(localStorage.getItem('tedigi_cart')) || [];
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.innerText = totalQty;
    
    // Ẩn badge nếu giỏ hàng trống (tùy chọn)
    countEl.style.display = totalQty > 0 ? 'flex' : 'none';
}

// ==========================================
// 5. CÁC HÀM TIỆN ÍCH KHÁC
// ==========================================
function logout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('displayName');
        window.location.href = "index.html";
    }
}

function toggleMobileMenu() {
    const nav = document.getElementById('navMenu');
    if (nav) nav.classList.toggle('active');
}

// ==========================================
// 6. KHỞI CHẠY HỆ THỐNG
// ==========================================
document.addEventListener('DOMContentLoaded', includeHTML);