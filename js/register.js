// Sistema de dados offline
class DataSystem {
    constructor() {
        this.companies = JSON.parse(localStorage.getItem('companies')) || [
            {
                id: 'comp1',
                name: 'TechSolutions Ltda',
                email: 'contato@techsolutions.com',
                cnpj: '12.345.678/0001-90',
                area: 'Tecnologia',
                website: 'https://techsolutions.com',
                description: 'Soluções tecnológicas inovadoras',
                representativeName: 'João Silva',
                phone: '(11) 99999-9999',
                approved: true,
                createdAt: new Date('2024-01-15')
            }
        ];
        
        this.users = JSON.parse(localStorage.getItem('users')) || [
            {
                id: 1,
                email: 'empresa@hub.com',
                password: 'empresa123',
                name: 'Empresa Exemplo',
                role: 'company',
                companyId: 'comp1'
            }
        ];
    }
    
    addCompany(companyData) {
        const newCompany = {
            ...companyData,
            id: 'comp' + Date.now(),
            approved: false,
            createdAt: new Date()
        };
        
        this.companies.push(newCompany);
        this.saveCompanies();
        
        return newCompany;
    }
    
    addUser(userData) {
        const newUser = {
            ...userData,
            id: Date.now(),
            role: 'company'
        };
        
        this.users.push(newUser);
        this.saveUsers();
        
        return newUser;
    }
    
    saveCompanies() {
        localStorage.setItem('companies', JSON.stringify(this.companies));
    }
    
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
    
    emailExists(email) {
        return this.users.some(user => user.email === email);
    }
    
    cnpjExists(cnpj) {
        return this.companies.some(company => company.cnpj === cnpj);
    }
}

// Instância global do sistema de dados
const dataSystem = new DataSystem();

// Formatação de CNPJ
function formatCNPJ(value) {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
}

// Formatação de telefone
function formatPhone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
}

// Validação de CNPJ
function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let weight = 5;
    
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpj[i]) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(cnpj[12]) !== digit) return false;
    
    sum = 0;
    weight = 6;
    
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpj[i]) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(cnpj[13]) === digit;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const cnpjInput = document.getElementById('cnpj');
    const phoneInput = document.getElementById('phone');
    
    // Formatação automática
    cnpjInput.addEventListener('input', function(e) {
        e.target.value = formatCNPJ(e.target.value);
    });
    
    phoneInput.addEventListener('input', function(e) {
        e.target.value = formatPhone(e.target.value);
    });
    
    // Submissão do formulário
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData);
        
        // Validações
        if (!validateForm(data)) {
            return;
        }
        
        try {
            // Criar empresa
            const companyData = {
                name: data.companyName,
                email: data.email,
                cnpj: data.cnpj,
                area: data.area,
                website: data.website,
                description: data.description,
                representativeName: data.representativeName,
                phone: data.phone
            };
            
            const newCompany = dataSystem.addCompany(companyData);
            
            // Criar usuário
            const userData = {
                email: data.email,
                password: data.password,
                name: data.representativeName,
                companyId: newCompany.id
            };
            
            dataSystem.addUser(userData);
            
            showSuccessMessage();
            
        } catch (error) {
            showError('Erro ao cadastrar empresa. Tente novamente.');
        }
    });
});

function validateForm(data) {
    const errorDiv = document.getElementById('errorMessage');
    
    // Limpar erros anteriores
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    
    // Validações
    if (!data.companyName.trim()) {
        showError('Nome da empresa é obrigatório');
        return false;
    }
    
    if (!validateCNPJ(data.cnpj)) {
        showError('CNPJ inválido');
        return false;
    }
    
    if (dataSystem.cnpjExists(data.cnpj)) {
        showError('CNPJ já cadastrado');
        return false;
    }
    
    if (!data.email.includes('@')) {
        showError('Email inválido');
        return false;
    }
    
    if (dataSystem.emailExists(data.email)) {
        showError('Email já cadastrado');
        return false;
    }
    
    if (data.password.length < 6) {
        showError('Senha deve ter pelo menos 6 caracteres');
        return false;
    }
    
    if (data.password !== data.confirmPassword) {
        showError('Senhas não coincidem');
        return false;
    }
    
    if (!data.representativeName.trim()) {
        showError('Nome do representante é obrigatório');
        return false;
    }
    
    if (!data.phone.trim()) {
        showError('Telefone é obrigatório');
        return false;
    }
    
    if (!data.description.trim()) {
        showError('Descrição da empresa é obrigatória');
        return false;
    }
    
    return true;
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Scroll para o erro
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccessMessage() {
    // Substituir o formulário por mensagem de sucesso
    const container = document.querySelector('.register-form');
    container.innerHTML = `
        <div class="logo">
            <div class="logo-icon">✅</div>
            <h1>Empresa Cadastrada com Sucesso!</h1>
            <p>Sua empresa foi cadastrada e está aguardando aprovação</p>
        </div>
        
        <div class="alert-info">
            <strong>Próximos passos:</strong><br>
            • Sua empresa passará por um processo de aprovação<br>
            • Você receberá uma notificação quando for aprovada<br>
            • Após aprovação, poderá fazer login e cadastrar produtos
        </div>
        
        <button onclick="location.href='index.html'" class="btn-primary">
            Fazer Login
        </button>
        
        <div class="form-footer">
            <a href="register.html">Cadastrar Outra Empresa</a>
        </div>
    `;
}