(function () {
    function readJson(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || 'null');
        } catch (error) {
            return null;
        }
    }

    function syncAdminMenu() {
        localStorage.removeItem('adminUser');
        let adminUser = null;
        try {
            adminUser = JSON.parse(sessionStorage.getItem('adminUser') || 'null');
        } catch (error) {
            sessionStorage.removeItem('adminUser');
        }
        const isAdmin = adminUser && adminUser.role === 'admin';

        document.querySelectorAll('.admin-menu-link').forEach((link) => {
            link.style.display = isAdmin ? 'block' : 'none';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncAdminMenu);
    } else {
        syncAdminMenu();
    }
})();
