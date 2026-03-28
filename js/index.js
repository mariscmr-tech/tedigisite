window.addEventListener('DOMContentLoaded', () => {
    if (typeof SCRIPT_URL !== 'undefined') {
        fetch(SCRIPT_URL).then(res => res.json()).then(data => {
            sessionStorage.setItem('tedigi_public_products', JSON.stringify(data));
        }).catch(err => console.log("Lỗi tải ngầm:", err));
    }
});