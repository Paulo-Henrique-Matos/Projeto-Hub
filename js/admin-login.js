// Sistema de autenticação para administradores
class AdminAuthSystem {
    constructor() {
        this.admins = [
            {
                id: 'admin1',
                email: 'admin@hub.com',
                password: 'admin123',
                name: 'Administrador',
                role: 'admin'
            }
        ];
        
        this.currentAdmin = null;
        this.loadCurrentAdmin();
    }
    
    login(email, password) {
        const admin = this.admins.find(a => a.email === email && a.password === password);
        if (admin) {
            this.currentAdmin = admin;
            localStorage.setItem('currentAdmin', JSON.stringify(admin));
            return true;
        }
        return false;
    }
    
    logout() {
        this.currentAdmin = null;
        localStorage.removeItem('currentAdmin');
    }
    
    loadCurrentAdmin() {
        const adminData = localStorage.getItem('currentAdmin');
        if (adminData) {
            this.currentAdmin = JSON.parse(adminData);
        }
    }
    
    getCurrentAdmin() {
        return this.currentAdmin;
    }
    
    isLoggedIn() {
        return this.currentAdmin !== null;
    }
}

// Instância global do sistema de autenticação admin
const adminAuthSystem = new AdminAuthSystem();

// Função para alternar visibilidade da senha
function togglePassword() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleBtn = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Event listener para o formulário de login admin
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado como admin
    if (adminAuthSystem.isLoggedIn()) {
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        if (adminAuthSystem.login(email, password)) {
            // Login bem-sucedido
            showMessage('Login administrativo realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1000);
        } else {
            // Login falhou
            showMessage('Credenciais administrativas incorretas!', 'error');
        }
    });
});

// Função para mostrar mensagens
function showMessage(message, type) {
    // Remove mensagem anterior se existir
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Cria nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.style.padding = '15px';
    messageDiv.style.borderRadius = '10px';
    messageDiv.style.margin = '15px 0';
    messageDiv.style.textAlign = 'center';
    
    if (type === 'success') {
        messageDiv.style.background = 'rgba(34, 197, 94, 0.2)';
        messageDiv.style.border = '1px solid rgba(34, 197, 94, 0.5)';
        messageDiv.style.color = '#86efac';
    } else {
        messageDiv.style.background = 'rgba(239, 68, 68, 0.2)';
        messageDiv.style.border = '1px solid rgba(239, 68, 68, 0.5)';
        messageDiv.style.color = '#fca5a5';
    }
    
    // Adiciona após o formulário
    const form = document.getElementById('adminLoginForm');
    form.appendChild(messageDiv);
    
    // Remove mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}