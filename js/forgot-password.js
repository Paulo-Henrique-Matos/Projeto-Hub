// Sistema de recuperação de senha (simulado)
document.addEventListener('DOMContentLoaded', function() {
    const forgotForm = document.getElementById('forgotForm');
    const messageDiv = document.getElementById('message');
    
    forgotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        // Validação básica
        if (!email || !email.includes('@')) {
            showMessage('Por favor, digite um email válido.', 'error');
            return;
        }
        
        // Simular envio de email
        simulatePasswordReset(email);
    });
});

function simulatePasswordReset(email) {
    const messageDiv = document.getElementById('message');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    // Mostrar loading
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Simular delay de envio
    setTimeout(() => {
        // Verificar se email existe (simulado)
        const emailExists = checkEmailExists(email);
        
        if (emailExists) {
            showMessage(
                `Um link de redefinição de senha foi enviado para ${email}. ` +
                'Verifique sua caixa de entrada e spam.',
                'success'
            );
            
            // Mostrar instruções adicionais
            setTimeout(() => {
                showAdditionalInstructions();
            }, 2000);
            
        } else {
            showMessage(
                'Email não encontrado em nossa base de dados. ' +
                'Verifique se digitou corretamente ou cadastre-se.',
                'error'
            );
        }
        
        // Restaurar botão
        submitBtn.textContent = 'Enviar Link';
        submitBtn.disabled = false;
        
    }, 2000);
}

function checkEmailExists(email) {
    // Simular verificação de email
    const knownEmails = [
        'empresa@hub.com',
        'admin@hub.com',
        'contato@techsolutions.com'
    ];
    
    return knownEmails.includes(email.toLowerCase());
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Scroll para a mensagem
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showAdditionalInstructions() {
    const messageDiv = document.getElementById('message');
    
    messageDiv.innerHTML = `
        <div class="success-content">
            <h3>📧 Email Enviado com Sucesso!</h3>
            <p>Instruções para redefinir sua senha:</p>
            <ol style="text-align: left; margin: 15px 0;">
                <li>Verifique sua caixa de entrada</li>
                <li>Procure por email do Portal HUB</li>
                <li>Clique no link de redefinição</li>
                <li>Crie uma nova senha segura</li>
            </ol>
            <p><strong>Não recebeu o email?</strong></p>
            <ul style="text-align: left; margin: 10px 0;">
                <li>Verifique a pasta de spam</li>
                <li>Aguarde alguns minutos</li>
                <li>Tente novamente se necessário</li>
            </ul>
        </div>
    `;
    
    messageDiv.className = 'message success';
    
    // Adicionar botão para tentar novamente
    setTimeout(() => {
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Enviar Novamente';
        retryBtn.className = 'btn-secondary';
        retryBtn.style.marginTop = '15px';
        retryBtn.onclick = () => location.reload();
        
        messageDiv.appendChild(retryBtn);
    }, 3000);
}