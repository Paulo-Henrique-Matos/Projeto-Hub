// Sistema de dados para dashboard
class DashboardSystem {
    constructor() {
        this.loadData();
    }
    
    loadData() {
        this.companies = JSON.parse(localStorage.getItem('companies')) || [];
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }
    
    getStats() {
        const approvedCompanies = this.companies.filter(c => c.approved);
        const approvedProducts = this.products.filter(p => p.approved);
        const completedTransactions = this.transactions.filter(t => t.status === 'completed');
        const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
        
        return {
            totalCompanies: approvedCompanies.length,
            totalProducts: approvedProducts.length,
            totalTransactions: completedTransactions.length,
            totalRevenue: totalRevenue
        };
    }
    
    getRecentTransactions(limit = 5) {
        return this.transactions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
    
    getTopCompanies(limit = 5) {
        const approvedCompanies = this.companies.filter(c => c.approved);
        return approvedCompanies
            .map(company => {
                const companyProducts = this.products.filter(p => p.companyId === company.id && p.approved);
                const companyTransactions = this.transactions.filter(t => t.sellerCompanyId === company.id);
                
                return {
                    ...company,
                    productsCount: companyProducts.length,
                    transactionsCount: companyTransactions.length
                };
            })
            .sort((a, b) => b.transactionsCount - a.transactionsCount)
            .slice(0, limit);
    }
}

// Instância global do sistema de dashboard
const dashboardSystem = new DashboardSystem();

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

// Carregar dados do dashboard
function loadDashboard() {
    const user = checkAuth();
    if (!user) return;
    
    // Atualizar nome do usuário
    document.getElementById('userName').textContent = user.name;
    
    // Carregar estatísticas
    loadStats();
    
    // Carregar transações recentes
    loadRecentTransactions();
    
    // Carregar empresas em destaque
    loadTopCompanies();
}

function loadStats() {
    const stats = dashboardSystem.getStats();
    
    document.getElementById('totalCompanies').textContent = stats.totalCompanies;
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalTransactions').textContent = stats.totalTransactions;
    document.getElementById('totalRevenue').textContent = `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`;
}

function loadRecentTransactions() {
    const transactions = dashboardSystem.getRecentTransactions();
    const container = document.getElementById('recentTransactions');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Nenhuma transação encontrada</p>';
        return;
    }
    
    container.innerHTML = transactions.map(transaction => {
        const product = dashboardSystem.products.find(p => p.id === transaction.productId);
        const seller = dashboardSystem.companies.find(c => c.id === transaction.sellerCompanyId);
        const buyer = dashboardSystem.companies.find(c => c.id === transaction.buyerCompanyId);
        
        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${product?.name || 'Produto não encontrado'}</h4>
                    <p>${buyer?.name || 'Comprador'} ← ${seller?.name || 'Vendedor'}</p>
                </div>
                <div class="transaction-value">
                    <div class="price">R$ ${(transaction.finalPrice || 0).toLocaleString('pt-BR')}</div>
                    <div class="discount">${transaction.discount || 0}% desconto</div>
                </div>
            </div>
        `;
    }).join('');
}

function loadTopCompanies() {
    const companies = dashboardSystem.getTopCompanies();
    const container = document.getElementById('topCompanies');
    
    if (companies.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Nenhuma empresa encontrada</p>';
        return;
    }
    
    container.innerHTML = companies.map((company, index) => `
        <div class="company-item">
            <div class="company-info">
                <h4>${index + 1}. ${company.name}</h4>
                <p>${company.productsCount} produtos • ${company.transactionsCount} vendas</p>
            </div>
        </div>
    `).join('');
}

// Inicializar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    
    // Atualizar dados a cada 30 segundos
    setInterval(() => {
        dashboardSystem.loadData();
        loadStats();
        loadRecentTransactions();
        loadTopCompanies();
    }, 30000);
});