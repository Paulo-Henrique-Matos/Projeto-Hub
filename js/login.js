// Sistema de autenticação offline
class AuthSystem {
    constructor() {
        this.users = [
            {
                id: 1,
                email: 'empresa@hub.com',
                password: 'empresa123',
                name: 'Empresa Exemplo',
                role: 'company',
                companyId: 'comp1'
            }
        ];
        
        this.currentUser = null;
        this.loadCurrentUser();
    }
    
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
    
    loadCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Instância global do sistema de autenticação
const authSystem = new AuthSystem();

// Função para alternar visibilidade da senha
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Event listener para o formulário de login
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    if (authSystem.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (authSystem.login(email, password)) {
            // Login bem-sucedido
            showMessage('Login realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // Login falhou
            showMessage('Email ou senha incorretos!', 'error');
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
    
    // Adiciona após o formulário
    const form = document.getElementById('loginForm');
    form.appendChild(messageDiv);
    
    // Remove mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}