// Sistema de administração
class AdminSystem {
    constructor() {
        this.loadData();
    }
    
    loadData() {
        this.companies = JSON.parse(localStorage.getItem('companies')) || [];
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }
    
    saveData() {
        localStorage.setItem('companies', JSON.stringify(this.companies));
        localStorage.setItem('products', JSON.stringify(this.products));
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }
    
    approveCompany(companyId) {
        const company = this.companies.find(c => c.id === companyId);
        if (company) {
            company.approved = true;
            this.saveData();
            return true;
        }
        return false;
    }
    
    approveProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.approved = true;
            this.saveData();
            return true;
        }
        return false;
    }
    
    updateProductDiscount(productId, discount) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.discount = discount;
            this.saveData();
            return true;
        }
        return false;
    }
    
    getPendingCompanies() {
        return this.companies.filter(c => !c.approved);
    }
    
    getApprovedCompanies() {
        return this.companies.filter(c => c.approved);
    }
    
    getPendingProducts() {
        return this.products.filter(p => !p.approved);
    }
    
    getApprovedProducts() {
        return this.products.filter(p => p.approved);
    }
    
    getStats() {
        const totalCompanies = this.companies.length;
        const totalProducts = this.products.length;
        const totalVolume = this.transactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
        
        return {
            totalCompanies,
            totalProducts,
            totalVolume
        };
    }
}

// Instância global do sistema admin
const adminSystem = new AdminSystem();

// Verificar autenticação admin
function checkAdminAuth() {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (!currentAdmin) {
        window.location.href = 'admin-login.html';
        return null;
    }
    return currentAdmin;
}

// Função de logout admin
function adminLogout() {
    localStorage.removeItem('currentAdmin');
    window.location.href = 'admin-login.html';
}

// Mostrar tab específica
function showTab(tabName) {
    // Esconder todas as tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover classe active de todos os links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar tab selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Adicionar classe active ao link
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    // Carregar dados da tab
    switch(tabName) {
        case 'companies':
            loadCompaniesTab();
            break;
        case 'products':
            loadProductsTab();
            break;
        case 'discounts':
            loadDiscountsTab();
            break;
        case 'reports':
            loadReportsTab();
            break;
    }
}

// Carregar tab de empresas
function loadCompaniesTab() {
    const pendingCompanies = adminSystem.getPendingCompanies();
    const approvedCompanies = adminSystem.getApprovedCompanies();
    
    // Atualizar contadores
    document.getElementById('pendingCompaniesCount').textContent = pendingCompanies.length;
    document.getElementById('approvedCompaniesCount').textContent = approvedCompanies.length;
    
    // Carregar empresas pendentes
    const pendingContainer = document.getElementById('pendingCompaniesList');
    if (pendingCompanies.length === 0) {
        pendingContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Nenhuma empresa pendente</p>';
    } else {
        pendingContainer.innerHTML = pendingCompanies.map(company => `
            <div class="approval-item">
                <div class="approval-info">
                    <h3>${company.name}</h3>
                    <p><strong>Email:</strong> ${company.email}</p>
                    <p><strong>CNPJ:</strong> ${company.cnpj}</p>
                    <p><strong>Área:</strong> ${company.area}</p>
                    <p><strong>Representante:</strong> ${company.representativeName}</p>
                    <p><strong>Telefone:</strong> ${company.phone}</p>
                    <p><strong>Descrição:</strong> ${company.description}</p>
                </div>
                <div class="approval-actions">
                    <button class="btn-approve" onclick="approveCompany('${company.id}')">
                        ✓ Aprovar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Carregar empresas aprovadas
    const approvedContainer = document.getElementById('approvedCompaniesList');
    if (approvedCompanies.length === 0) {
        approvedContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Nenhuma empresa aprovada</p>';
    } else {
        approvedContainer.innerHTML = approvedCompanies.map(company => `
            <div class="company-card">
                <h4>${company.name}</h4>
                <p><strong>Email:</strong> ${company.email}</p>
                <p><strong>CNPJ:</strong> ${company.cnpj}</p>
                <p><strong>Área:</strong> ${company.area}</p>
                <p><strong>Representante:</strong> ${company.representativeName}</p>
            </div>
        `).join('');
    }
}

// Carregar tab de produtos
function loadProductsTab() {
    const pendingProducts = adminSystem.getPendingProducts();
    
    // Atualizar contador
    document.getElementById('pendingProductsCount').textContent = pendingProducts.length;
    
    // Carregar produtos pendentes
    const container = document.getElementById('pendingProductsList');
    if (pendingProducts.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Nenhum produto pendente</p>';
    } else {
        container.innerHTML = pendingProducts.map(product => {
            const company = adminSystem.companies.find(c => c.id === product.companyId);
            return `
                <div class="approval-item">
                    <div class="approval-info">
                        <h3>${product.name}</h3>
                        <p><strong>Empresa:</strong> ${company?.name || 'Não encontrada'}</p>
                        <p><strong>Categoria:</strong> ${product.category}</p>
                        <p><strong>Preço:</strong> R$ ${(product.price || 0).toLocaleString('pt-BR')}</p>
                        <p><strong>Descrição:</strong> ${product.description}</p>
                    </div>
                    <div class="approval-actions">
                        <button class="btn-approve" onclick="approveProduct('${product.id}')">
                            ✓ Aprovar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Carregar tab de descontos
function loadDiscountsTab() {
    const approvedProducts = adminSystem.getApprovedProducts();
    const container = document.getElementById('discountsList');
    
    if (approvedProducts.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Nenhum produto aprovado</p>';
        return;
    }
    
    container.innerHTML = approvedProducts.map(product => {
        const company = adminSystem.companies.find(c => c.id === product.companyId);
        return `
            <div class="discount-item">
                <div class="discount-info">
                    <h4>${product.name}</h4>
                    <p><strong>Empresa:</strong> ${company?.name || 'Não encontrada'}</p>
                    <p><strong>Preço:</strong> R$ ${(product.price || 0).toLocaleString('pt-BR')}</p>
                    <p><strong>Desconto atual:</strong> ${product.discount || 0}%</p>
                </div>
                <div class="discount-controls">
                    <input type="number" class="discount-input" id="discount-${product.id}" 
                           min="0" max="50" value="${product.discount || 0}" placeholder="0">
                    <span style="color: rgba(255,255,255,0.7);">%</span>
                    <button class="btn-apply" onclick="applyDiscount('${product.id}')">
                        Aplicar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Carregar tab de relatórios
function loadReportsTab() {
    const stats = adminSystem.getStats();
    
    // Atualizar estatísticas
    document.getElementById('totalCompaniesReport').textContent = stats.totalCompanies;
    document.getElementById('totalProductsReport').textContent = stats.totalProducts;
    document.getElementById('totalVolumeReport').textContent = `R$ ${stats.totalVolume.toLocaleString('pt-BR')}`;
    
    // Carregar transações
    const container = document.getElementById('transactionsList');
    if (adminSystem.transactions.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Nenhuma transação encontrada</p>';
        return;
    }
    
    container.innerHTML = adminSystem.transactions.map(transaction => {
        const product = adminSystem.products.find(p => p.id === transaction.productId);
        const seller = adminSystem.companies.find(c => c.id === transaction.sellerCompanyId);
        const buyer = adminSystem.companies.find(c => c.id === transaction.buyerCompanyId);
        
        const statusClass = transaction.status === 'completed' ? 'status-completed' : 
                           transaction.status === 'pending' ? 'status-pending' : 'status-cancelled';
        
        const statusText = transaction.status === 'completed' ? 'Concluída' : 
                          transaction.status === 'pending' ? 'Pendente' : 'Cancelada';
        
        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${product?.name || 'Produto não encontrado'}</h4>
                    <p><strong>Vendedor:</strong> ${seller?.name || 'Não encontrado'}</p>
                    <p><strong>Comprador:</strong> ${buyer?.name || 'Não encontrado'}</p>
                    <p><strong>Data:</strong> ${new Date(transaction.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div class="transaction-value">
                    <div class="price">R$ ${(transaction.finalPrice || 0).toLocaleString('pt-BR')}</div>
                    <div class="discount">Desconto: ${transaction.discount || 0}%</div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Funções de ação
function approveCompany(companyId) {
    if (adminSystem.approveCompany(companyId)) {
        showNotification('Empresa aprovada com sucesso!', 'success');
        loadCompaniesTab();
    } else {
        showNotification('Erro ao aprovar empresa', 'error');
    }
}

function approveProduct(productId) {
    if (adminSystem.approveProduct(productId)) {
        showNotification('Produto aprovado com sucesso!', 'success');
        loadProductsTab();
    } else {
        showNotification('Erro ao aprovar produto', 'error');
    }
}

function applyDiscount(productId) {
    const discountInput = document.getElementById(`discount-${productId}`);
    const discount = parseInt(discountInput.value) || 0;
    
    if (discount < 0 || discount > 50) {
        showNotification('Desconto deve estar entre 0% e 50%', 'error');
        return;
    }
    
    if (adminSystem.updateProductDiscount(productId, discount)) {
        showNotification('Desconto aplicado com sucesso!', 'success');
        loadDiscountsTab();
    } else {
        showNotification('Erro ao aplicar desconto', 'error');
    }
}

function exportTransactions() {
    const transactions = adminSystem.transactions;
    const csvContent = "data:text/csv;charset=utf-8," + 
        "ID,Produto,Vendedor,Comprador,Valor,Desconto,Status,Data\n" +
        transactions.map(t => {
            const product = adminSystem.products.find(p => p.id === t.productId);
            const seller = adminSystem.companies.find(c => c.id === t.sellerCompanyId);
            const buyer = adminSystem.companies.find(c => c.id === t.buyerCompanyId);
            
            return `${t.id},"${product?.name || 'N/A'}","${seller?.name || 'N/A'}","${buyer?.name || 'N/A'}",${t.finalPrice || 0},${t.discount || 0}%,${t.status},${new Date(t.createdAt).toLocaleDateString('pt-BR')}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transacoes_portal_hub.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Relatório exportado com sucesso!', 'success');
}

// Função para mostrar notificações
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
        notification.style.background = 'rgba(34, 197, 94, 0.9)';
        notification.style.border = '1px solid rgba(34, 197, 94, 1)';
    } else {
        notification.style.background = 'rgba(239, 68, 68, 0.9)';
        notification.style.border = '1px solid rgba(239, 68, 68, 1)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Inicializar painel admin
document.addEventListener('DOMContentLoaded', function() {
    const admin = checkAdminAuth();
    if (!admin) return;
    
    // Carregar dados iniciais
    adminSystem.loadData();
    
    // Mostrar primeira tab
    showTab('companies');
    
    // Atualizar dados a cada 30 segundos
    setInterval(() => {
        adminSystem.loadData();
        // Recarregar tab ativa
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            showTab(activeTab.id);
        }
    }, 30000);
});