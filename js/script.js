// Dán URL Web App của Google Apps Script vào đây
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwzPIf4AFl1eWIiSIXSc_OXeC56Wce6_vQHvDeS04nUhMxvbxcLPpYo-XTrLmDhQLsR/exec";

// Lấy các phần tử từ giao diện
const loginForm = document.getElementById('loginForm');
const messageEl = document.getElementById('message');
const loginBtn = document.getElementById('loginBtn');

// Lắng nghe sự kiện khi người dùng bấm nút Đăng nhập hoặc nhấn Enter
loginForm.addEventListener('submit', function(event) {
    // Ngăn chặn trang web tự động tải lại khi submit form
    event.preventDefault(); 

    // Lấy dữ liệu người dùng nhập
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    // Hiển thị trạng thái chờ
    messageEl.textContent = "Đang xác thực...";
    messageEl.className = ""; // Xóa màu cũ
    loginBtn.disabled = true; // Khóa nút bấm tạm thời

    // Gửi yêu cầu lên Google Sheets
    fetch(SCRIPT_URL, {
        method: 'POST',
        // MẸO QUAN TRỌNG: Dùng text/plain để không bị Google chặn lỗi CORS (Preflight)
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(response => response.json()) // Biến kết quả trả về thành dạng Object
    .then(data => {
        if (data.status === "success") {
            messageEl.textContent = data.message;
            messageEl.className = "success";
            // Lưu trạng thái, tên và QUYỀN HẠN vào máy
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("currentUser", user);
            localStorage.setItem("userRole", data.role); // <--- Dòng này rất quan trọng

            // Đợi 1 giây rồi chuyển thẳng vào trang Quản trị
            setTimeout(() => {
                window.location.href = "admin.html";
            }, 1000);
        } 
        else {
            messageEl.textContent = data.message;
            messageEl.className = "error";
        }
    })
    .catch(error => {
        console.error("Lỗi:", error);
        messageEl.textContent = "Lỗi kết nối đến máy chủ!";
        messageEl.className = "error";
    })
    .finally(() => {
        // Mở khóa lại nút bấm dù thành công hay thất bại
        loginBtn.disabled = false; 
    });
});