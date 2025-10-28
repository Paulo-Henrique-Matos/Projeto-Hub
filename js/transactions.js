// Sistema de transações
class TransactionSystem {
    constructor() {
        this.loadData();
        this.currentFilters = {
            status: '',
            period: '',
            search: ''
        };
        this.currentPage = 1;
        this.itemsPerPage = 10;
    }
    
    loadData() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.companies = JSON.parse(localStorage.getItem('companies')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    
    getUserTransactions() {
        return this.transactions.filter(transaction => 
            transaction.buyerCompanyId === this.currentUser.companyId ||
            transaction.sellerCompanyId === this.currentUser.companyId
        );
    }
    
    getFilteredTransactions() {
        let filtered = this.getUserTransactions();
        
        // Filtro de status
        if (this.currentFilters.status) {
            filtered = filtered.filter(transaction => 
                transaction.status === this.currentFilters.status
            );
        }
        
        // Filtro de período
        if (this.currentFilters.period) {
            const now = new Date();
            const transactionDate = new Date();
            
            filtered = filtered.filter(transaction => {
                const tDate = new Date(transaction.createdAt);
                
                switch (this.currentFilters.period) {
                    case 'today':
                        return tDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return tDate >= weekAgo;
                    case 'month':
                        return tDate.getMonth() === now.getMonth() && 
                               tDate.getFullYear() === now.getFullYear();
                    case 'year':
                        return tDate.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });
        }
        
        // Filtro de busca
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(transaction => {
                const product = this.products.find(p => p.id === transaction.productId);
                const company = this.companies.find(c => c.id === transaction.sellerCompanyId);
                
                return (product?.name.toLowerCase().includes(searchTerm)) ||
                       (company?.name.toLowerCase().includes(searchTerm)) ||
                       (transaction.id.toLowerCase().includes(searchTerm));
            });
        }
        
        // Ordenar por data (mais recente primeiro)
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    getSummary() {
        const userTransactions = this.getUserTransactions().filter(t => t.status === 'completed');
        
        const totalSpent = userTransactions
            .filter(t => t.buyerCompanyId === this.currentUser.companyId)
            .reduce((sum, t) => sum + (t.finalPrice || 0), 0);
        
        const totalSaved = userTransactions
            .filter(t => t.buyerCompanyId === this.currentUser.companyId)
            .reduce((sum, t) => sum + ((t.originalPrice || 0) - (t.finalPrice || 0)), 0);
        
        const totalTransactions = userTransactions.length;
        
        const avgDiscount = userTransactions.length > 0
            ? Math.round(userTransactions.reduce((sum, t) => sum + (t.discount || 0), 0) / userTransactions.length)
            : 0;
        
        return {
            totalSpent,
            totalSaved,
            totalTransactions,
            avgDiscount
        };
    }
}

// Instância global do sistema
const transactionSystem = new TransactionSystem();
let selectedTransaction = null;

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

// Carregar página de transações
function loadTransactions() {
    loadSummary();
    loadTransactionsList();
}

// Carregar resumo
function loadSummary() {
    const summary = transactionSystem.getSummary();
    
    document.getElementById('totalSpent').textContent = `R$ ${summary.totalSpent.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('totalSaved').textContent = `R$ ${summary.totalSaved.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('totalTransactions').textContent = summary.totalTransactions;
    document.getElementById('avgDiscount').textContent = summary.avgDiscount + '%';
}

// Carregar lista de transações
function loadTransactionsList() {
    const transactions = transactionSystem.getFilteredTransactions();
    const container = document.getElementById('transactionsList');
    const noTransactions = document.getElementById('noTransactions');
    
    if (transactions.length === 0) {
        container.style.display = 'none';
        noTransactions.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    noTransactions.style.display = 'none';
    
    container.innerHTML = transactions.map(transaction => {
        const product = transactionSystem.products.find(p => p.id === transaction.productId);
        const company = transactionSystem.companies.find(c => c.id === transaction.sellerCompanyId);
        const date = new Date(transaction.createdAt).toLocaleDateString('pt-BR');
        
        const statusClass = transaction.status === 'completed' ? 'status-completed' : 
                           transaction.status === 'pending' ? 'status-pending' : 'status-cancelled';
        
        const statusText = transaction.status === 'completed' ? 'Concluída' : 
                          transaction.status === 'pending' ? 'Pendente' : 'Cancelada';
        
        return `
            <div class="transaction-row" onclick="showTransactionDetails('${transaction.id}')">
                <div class="cell date">${date}</div>
                <div class="cell product">${product?.name || 'Produto não encontrado'}</div>
                <div class="cell company">${company?.name || 'Empresa não encontrada'}</div>
                <div class="cell original-price">R$ ${(transaction.originalPrice || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                <div class="cell discount">${transaction.discount || 0}%</div>
                <div class="cell final-price">R$ ${(transaction.finalPrice || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                <div class="cell status">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="cell actions">
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="event.stopPropagation(); showTransactionDetails('${transaction.id}')">Ver</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filtrar transações
function filterTransactions() {
    const statusFilter = document.getElementById('statusFilter').value;
    const periodFilter = document.getElementById('periodFilter').value;
    
    transactionSystem.currentFilters.status = statusFilter;
    transactionSystem.currentFilters.period = periodFilter;
    
    loadTransactionsList();
}

// Buscar transações
function searchTransactions() {
    const searchTerm = document.getElementById('searchTransaction').value;
    transactionSystem.currentFilters.search = searchTerm;
    loadTransactionsList();
}

// Limpar filtros
function clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('periodFilter').value = '';
    document.getElementById('searchTransaction').value = '';
    
    transactionSystem.currentFilters = {
        status: '',
        period: '',
        search: ''
    };
    
    loadTransactionsList();
}

// Mostrar detalhes da transação
function showTransactionDetails(transactionId) {
    const transaction = transactionSystem.transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    const product = transactionSystem.products.find(p => p.id === transaction.productId);
    const company = transactionSystem.companies.find(c => c.id === transaction.sellerCompanyId);
    const date = new Date(transaction.createdAt).toLocaleString('pt-BR');
    
    const statusClass = transaction.status === 'completed' ? 'status-completed' : 
                       transaction.status === 'pending' ? 'status-pending' : 'status-cancelled';
    
    const statusText = transaction.status === 'completed' ? 'Concluída' : 
                      transaction.status === 'pending' ? 'Pendente' : 'Cancelada';
    
    const savings = (transaction.originalPrice || 0) - (transaction.finalPrice || 0);
    
    selectedTransaction = transaction;
    
    document.getElementById('modalTransactionId').textContent = transaction.id;
    document.getElementById('modalTransactionDate').textContent = date;
    document.getElementById('modalTransactionStatus').textContent = statusText;
    document.getElementById('modalTransactionStatus').className = `status-badge ${statusClass}`;
    
    document.getElementById('modalProductName').textContent = product?.name || 'Produto não encontrado';
    document.getElementById('modalCompanyName').textContent = company?.name || 'Empresa não encontrada';
    document.getElementById('modalProductCategory').textContent = product?.category || 'N/A';
    
    document.getElementById('modalOriginalPrice').textContent = `R$ ${(transaction.originalPrice || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('modalDiscount').textContent = `${transaction.discount || 0}%`;
    document.getElementById('modalFinalPrice').textContent = `R$ ${(transaction.finalPrice || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('modalSavings').textContent = `R$ ${savings.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    document.getElementById('transactionModal').style.display = 'block';
}

// Fechar modal de detalhes
function closeTransactionModal() {
    document.getElementById('transactionModal').style.display = 'none';
    selectedTransaction = null;
}

// Baixar comprovante
function downloadReceipt() {
    if (!selectedTransaction) return;
    
    const product = transactionSystem.products.find(p => p.id === selectedTransaction.productId);
    const company = transactionSystem.companies.find(c => c.id === selectedTransaction.sellerCompanyId);
    
    // Simular download de comprovante
    const receiptContent = `
PORTAL HUB - COMPROVANTE DE TRANSAÇÃO

ID da Transação: ${selectedTransaction.id}
Data: ${new Date(selectedTransaction.createdAt).toLocaleString('pt-BR')}
Status: ${selectedTransaction.status}

PRODUTO/SERVIÇO:
${product?.name || 'Produto não encontrado'}
Empresa: ${company?.name || 'Empresa não encontrada'}
Categoria: ${product?.category || 'N/A'}

VALORES:
Valor Original: R$ ${(selectedTransaction.originalPrice || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Desconto HUB: ${selectedTransaction.discount || 0}%
Valor Final: R$ ${(selectedTransaction.finalPrice || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Economia: R$ ${((selectedTransaction.originalPrice || 0) - (selectedTransaction.finalPrice || 0)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}

Portal HUB - Conectando empresas do Brasil
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante_${selectedTransaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Exportar transações
function exportTransactions(format) {
    const transactions = transactionSystem.getUserTransactions();
    
    if (format === 'csv') {
        const csvContent = "data:text/csv;charset=utf-8," + 
            "ID,Data,Produto,Empresa,Valor Original,Desconto,Valor Final,Status\n" +
            transactions.map(t => {
                const product = transactionSystem.products.find(p => p.id === t.productId);
                const company = transactionSystem.companies.find(c => c.id === t.sellerCompanyId);
                const date = new Date(t.createdAt).toLocaleDateString('pt-BR');
                
                return `${t.id},"${date}","${product?.name || 'N/A'}","${company?.name || 'N/A'}",${t.originalPrice || 0},${t.discount || 0}%,${t.finalPrice || 0},${t.status}`;
            }).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "transacoes_portal_hub.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (format === 'pdf') {
        // Simular exportação PDF
        alert('Funcionalidade de exportação PDF será implementada em breve!');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;
    
    // Atualizar nome do usuário
    document.getElementById('userName').textContent = user.name;
    
    // Carregar dados iniciais
    transactionSystem.loadData();
    loadTransactions();
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('transactionModal');
        if (e.target === modal) {
            closeTransactionModal();
        }
    });
    
    // Atualizar dados a cada 30 segundos
    setInterval(() => {
        transactionSystem.loadData();
        loadSummary();
    }, 30000);
});