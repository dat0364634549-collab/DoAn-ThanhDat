(function () {
    function readJson(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || 'null');
        } catch (error) {
            return null;
        }
    }

    function syncAdminMenu() {
        const currentUser = readJson('currentUser');
        const adminUser = readJson('adminUser');
        const isAdmin =
            (currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@gmail.com')) ||
            (adminUser && (adminUser.role === 'admin' || adminUser.email === 'admin@gmail.com'));

        if (currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@gmail.com')) {
            localStorage.setItem('adminUser', JSON.stringify({ ...currentUser, role: 'admin' }));
        }

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
