// Sistema de catálogo de produtos
class CatalogSystem {
    constructor() {
        this.loadData();
        this.currentFilters = {
            search: '',
            category: '',
            priceRange: ''
        };
        this.currentPage = 1;
        this.itemsPerPage = 12;
    }
    
    loadData() {
        this.companies = JSON.parse(localStorage.getItem('companies')) || [];
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    
    saveData() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }
    
    getApprovedProducts() {
        return this.products.filter(product => product.approved);
    }
    
    getApprovedCompanies() {
        return this.companies.filter(company => company.approved);
    }
    
    addProduct(productData) {
        const newProduct = {
            ...productData,
            id: 'prod' + Date.now(),
            companyId: this.currentUser.companyId,
            approved: false,
            discount: 0,
            createdAt: new Date().toISOString()
        };
        
        this.products.push(newProduct);
        this.saveData();
        
        return newProduct;
    }
    
    getFilteredProducts() {
        let filtered = this.getApprovedProducts();
        
        // Filtro de busca
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                (product.tags && product.tags.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filtro de categoria
        if (this.currentFilters.category) {
            filtered = filtered.filter(product => 
                product.category === this.currentFilters.category
            );
        }
        
        // Filtro de preço
        if (this.currentFilters.priceRange) {
            const [min, max] = this.currentFilters.priceRange.split('-').map(Number);
            filtered = filtered.filter(product => {
                const price = product.price;
                if (max) {
                    return price >= min && price <= max;
                } else {
                    return price >= min;
                }
            });
        }
        
        return filtered;
    }
    
    getStats() {
        const approvedProducts = this.getApprovedProducts();
        const approvedCompanies = this.getApprovedCompanies();
        const avgDiscount = approvedProducts.length > 0 
            ? Math.round(approvedProducts.reduce((sum, p) => sum + (p.discount || 0), 0) / approvedProducts.length)
            : 0;
        
        return {
            totalProducts: approvedProducts.length,
            totalCompanies: approvedCompanies.length,
            avgDiscount: avgDiscount
        };
    }
}

// Instância global do sistema
const catalogSystem = new CatalogSystem();
let selectedProduct = null;

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

// Carregar catálogo
function loadCatalog() {
    loadStats();
    loadProducts();
}

// Carregar estatísticas
function loadStats() {
    const stats = catalogSystem.getStats();
    
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalCompanies').textContent = stats.totalCompanies;
    document.getElementById('avgDiscount').textContent = stats.avgDiscount + '%';
}

// Carregar produtos
function loadProducts() {
    const products = catalogSystem.getFilteredProducts();
    const container = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    if (products.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    noResults.style.display = 'none';
    
    container.innerHTML = products.map(product => {
        const company = catalogSystem.companies.find(c => c.id === product.companyId);
        const originalPrice = product.price;
        const discount = product.discount || 0;
        const finalPrice = originalPrice * (1 - discount / 100);
        
        return `
            <div class="product-card" onclick="showProductDetails('${product.id}')">
                <div class="product-header">
                    <div>
                        <div class="product-title">${product.name}</div>
                        <div class="product-company">${company?.name || 'Empresa não encontrada'}</div>
                    </div>
                    <div class="product-category">${product.category}</div>
                </div>
                
                <div class="product-description">
                    ${product.description}
                </div>
                
                <div class="product-footer">
                    <div class="product-price">
                        ${discount > 0 ? `<span class="original-price">R$ ${originalPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>` : ''}
                        <span class="final-price">R$ ${finalPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>
                    ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Buscar produtos
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value;
    catalogSystem.currentFilters.search = searchTerm;
    loadProducts();
}

// Filtrar produtos
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    
    catalogSystem.currentFilters.category = categoryFilter;
    catalogSystem.currentFilters.priceRange = priceFilter;
    
    loadProducts();
}

// Limpar filtros
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    
    catalogSystem.currentFilters = {
        search: '',
        category: '',
        priceRange: ''
    };
    
    loadProducts();
}

// Mostrar modal de adicionar produto
function showAddProductModal() {
    document.getElementById('addProductModal').style.display = 'block';
}

// Fechar modal de adicionar produto
function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
    document.getElementById('productForm').reset();
}

// Mostrar detalhes do produto
function showProductDetails(productId) {
    const product = catalogSystem.products.find(p => p.id === productId);
    if (!product) return;
    
    const company = catalogSystem.companies.find(c => c.id === product.companyId);
    const originalPrice = product.price;
    const discount = product.discount || 0;
    const finalPrice = originalPrice * (1 - discount / 100);
    
    selectedProduct = product;
    
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalCompanyName').textContent = company?.name || 'Empresa não encontrada';
    document.getElementById('modalProductCategory').textContent = product.category;
    document.getElementById('modalProductDescription').textContent = product.description;
    
    if (discount > 0) {
        document.getElementById('modalOriginalPrice').textContent = `R$ ${originalPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        document.getElementById('modalOriginalPrice').style.display = 'inline';
        document.getElementById('modalDiscount').textContent = `${discount}% OFF`;
        document.getElementById('modalDiscount').style.display = 'inline';
    } else {
        document.getElementById('modalOriginalPrice').style.display = 'none';
        document.getElementById('modalDiscount').style.display = 'none';
    }
    
    document.getElementById('modalFinalPrice').textContent = `R$ ${finalPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    // Tags
    const tagsContainer = document.getElementById('modalProductTags');
    if (product.tags) {
        const tags = product.tags.split(',').map(tag => tag.trim());
        tagsContainer.innerHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    } else {
        tagsContainer.innerHTML = '';
    }
    
    document.getElementById('productModal').style.display = 'block';
}

// Fechar modal de detalhes
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    selectedProduct = null;
}

// Comprar produto
function buyProduct() {
    if (!selectedProduct) return;
    
    // Simular compra
    const transaction = {
        id: 'trans' + Date.now(),
        productId: selectedProduct.id,
        buyerCompanyId: catalogSystem.currentUser.companyId,
        sellerCompanyId: selectedProduct.companyId,
        originalPrice: selectedProduct.price,
        discount: selectedProduct.discount || 0,
        finalPrice: selectedProduct.price * (1 - (selectedProduct.discount || 0) / 100),
        status: 'completed',
        createdAt: new Date().toISOString()
    };
    
    // Salvar transação
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    alert('Compra realizada com sucesso!');
    closeProductModal();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;
    
    // Atualizar nome do usuário
    document.getElementById('userName').textContent = user.name;
    
    // Carregar dados iniciais
    catalogSystem.loadData();
    loadCatalog();
    
    // Formulário de adicionar produto
    const productForm = document.getElementById('productForm');
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(productForm);
        const data = Object.fromEntries(formData);
        
        // Validações básicas
        if (!data.productName.trim() || !data.productCategory || !data.productPrice || !data.productDescription.trim()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        try {
            catalogSystem.addProduct({
                name: data.productName,
                category: data.productCategory,
                price: parseFloat(data.productPrice),
                description: data.productDescription,
                tags: data.productTags
            });
            
            alert('Produto adicionado com sucesso! Aguardando aprovação do administrador.');
            closeAddProductModal();
            
        } catch (error) {
            alert('Erro ao adicionar produto. Tente novamente.');
            console.error('Erro:', error);
        }
    });
    
    // Busca em tempo real
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(e) {
        const addModal = document.getElementById('addProductModal');
        const productModal = document.getElementById('productModal');
        
        if (e.target === addModal) {
            closeAddProductModal();
        }
        if (e.target === productModal) {
            closeProductModal();
        }
    });
    
    // Atualizar dados a cada 30 segundos
    setInterval(() => {
        catalogSystem.loadData();
        loadStats();
    }, 30000);
});