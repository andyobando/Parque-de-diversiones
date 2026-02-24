document.addEventListener('DOMContentLoaded', () => {
    const btnVisitante = document.getElementById('btnVisitante');
    const btnLoginOpen = document.getElementById('btnLoginOpen');
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const btnCloseLogin = document.getElementById('btnCloseLogin');
    const btnCancelLogin = document.getElementById('btnCancelLogin');

    // Visitante Logic
    btnVisitante.addEventListener('click', () => {
        localStorage.setItem('isAdmin', 'false');
        window.location.href = 'atracciones.html';
    });

    // Admin Login Logic
    btnLoginOpen.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });

    const closeLoginModal = () => {
        loginModal.classList.add('hidden');
        loginForm.reset();
    };

    btnCloseLogin.addEventListener('click', closeLoginModal);
    btnCancelLogin.addEventListener('click', closeLoginModal);

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('adminUser').value;
        const pass = document.getElementById('adminPass').value;

        if (user === 'admin' && pass === '1234') {
            localStorage.setItem('isAdmin', 'true');
            window.location.href = 'atracciones.html';
        } else {
            alert('Credenciales incorrectas');
        }
    });
});
