// Sistema de cadastro de empresas
class CompanyRegistrationSystem {
    constructor() {
        this.loadData();
    }
    
    loadData() {
        this.companies = JSON.parse(localStorage.getItem('companies')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }
    
    saveData() {
        localStorage.setItem('companies', JSON.stringify(this.companies));
        localStorage.setItem('users', JSON.stringify(this.users));
    }
    
    addCompany(companyData) {
        const newCompany = {
            ...companyData,
            id: 'comp' + Date.now(),
            approved: false,
            createdAt: new Date().toISOString()
        };
        
        this.companies.push(newCompany);
        this.saveData();
        
        return newCompany;
    }
    
    emailExists(email) {
        return this.users.some(user => user.email === email) || 
               this.companies.some(company => company.email === email);
    }
    
    cnpjExists(cnpj) {
        return this.companies.some(company => company.cnpj === cnpj);
    }
}

// Instância global do sistema
const companyRegSystem = new CompanyRegistrationSystem();

// Verificar autenticação
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return null;
    }
    return currentUser;
}

// Função de logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

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

// Formatação de CEP
function formatCEP(value) {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .substring(0, 9);
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

// Limpar formulário
function clearForm() {
    document.getElementById('companyForm').reset();
    hideMessages();
}

// Mostrar mensagem de erro
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Esconder mensagem de sucesso
    document.getElementById('successMessage').style.display = 'none';
    
    // Scroll para o erro
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Mostrar mensagem de sucesso
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    // Esconder mensagem de erro
    document.getElementById('errorMessage').style.display = 'none';
    
    // Scroll para o sucesso
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Esconder mensagens
function hideMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

// Validar formulário
function validateForm(data) {
    // Validações obrigatórias
    if (!data.companyName.trim()) {
        showError('Nome da empresa é obrigatório');
        return false;
    }
    
    if (!validateCNPJ(data.cnpj)) {
        showError('CNPJ inválido');
        return false;
    }
    
    if (companyRegSystem.cnpjExists(data.cnpj)) {
        showError('CNPJ já cadastrado');
        return false;
    }
    
    if (!data.area) {
        showError('Área de atuação é obrigatória');
        return false;
    }
    
    if (!data.description.trim()) {
        showError('Descrição da empresa é obrigatória');
        return false;
    }
    
    if (!data.representativeName.trim()) {
        showError('Nome do representante é obrigatório');
        return false;
    }
    
    if (!data.email.includes('@')) {
        showError('Email inválido');
        return false;
    }
    
    if (companyRegSystem.emailExists(data.email)) {
        showError('Email já cadastrado');
        return false;
    }
    
    if (!data.phone.trim()) {
        showError('Telefone é obrigatório');
        return false;
    }
    
    return true;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;
    
    // Atualizar nome do usuário
    document.getElementById('userName').textContent = user.name;
    
    const companyForm = document.getElementById('companyForm');
    const cnpjInput = document.getElementById('cnpj');
    const phoneInput = document.getElementById('phone');
    const cepInput = document.getElementById('cep');
    
    // Formatação automática
    cnpjInput.addEventListener('input', function(e) {
        e.target.value = formatCNPJ(e.target.value);
    });
    
    phoneInput.addEventListener('input', function(e) {
        e.target.value = formatPhone(e.target.value);
    });
    
    cepInput.addEventListener('input', function(e) {
        e.target.value = formatCEP(e.target.value);
    });
    
    // Submissão do formulário
    companyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(companyForm);
        const data = Object.fromEntries(formData);
        
        // Validar formulário
        if (!validateForm(data)) {
            return;
        }
        
        try {
            // Adicionar empresa
            const newCompany = companyRegSystem.addCompany(data);
            
            showSuccess('Empresa cadastrada com sucesso! Aguardando aprovação do administrador.');
            
            // Limpar formulário após 2 segundos
            setTimeout(() => {
                clearForm();
            }, 2000);
            
        } catch (error) {
            showError('Erro ao cadastrar empresa. Tente novamente.');
            console.error('Erro:', error);
        }
    });
    
    // Esconder mensagens ao digitar
    const inputs = companyForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', hideMessages);
    });
});