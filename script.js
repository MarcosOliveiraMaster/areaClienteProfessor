// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleRegister = document.getElementById('toggleRegister');
    const backToLogin = document.getElementById('backToLogin');
    const passwordInput = document.getElementById('password');
    const registerPasswordInput = document.getElementById('registerPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strengthValue');
    const toast = document.getElementById('toast');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const brandPanel = document.querySelector('.brand-panel');
    
    // Estado da aplicação
    const state = {
        isRegisterVisible: false,
        passwordVisible: false,
        registerPasswordVisible: false
    };
    
    // Inicialização
    init();
    
    function init() {
        // Configurar event listeners
        setupEventListeners();
        
        // Configurar validação de formulários
        setupFormValidation();
        
        // Restaurar estado do formulário se existir
        restoreFormState();
    }
    
    function setupEventListeners() {
        // Alternar entre login e cadastro
        if (toggleRegister) {
            toggleRegister.addEventListener('click', function(e) {
                e.preventDefault();
                showRegisterForm();
            });
        }
        
        if (backToLogin) {
            backToLogin.addEventListener('click', function(e) {
                e.preventDefault();
                showLoginForm();
            });
        }
        
        // Alternar visibilidade da senha
        const togglePasswordButtons = document.querySelectorAll('.toggle-password');
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    this.setAttribute('aria-label', 'Ocultar senha');
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                    this.setAttribute('aria-label', 'Mostrar senha');
                }
            });
        });
        
        // Validar força da senha em tempo real
        if (registerPasswordInput) {
            registerPasswordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = calculatePasswordStrength(password);
                updatePasswordStrengthIndicator(strength);
            });
        }
        
        // Seleção de função (aluno/professor)
        const roleOptions = document.querySelectorAll('.role-option');
        roleOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remover classe active de todas as opções
                roleOptions.forEach(opt => opt.classList.remove('active'));
                
                // Adicionar classe active à opção clicada
                this.classList.add('active');
                
                // Armazenar seleção
                const role = this.dataset.role;
                localStorage.setItem('selectedRole', role);
            });
        });
        
        // Menu mobile
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        }
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (brandPanel && brandPanel.style.display === 'block' && 
                !brandPanel.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                brandPanel.style.display = 'none';
            }
        });
    }
    
    function setupFormValidation() {
        // Validação do formulário de login
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Coletar dados do formulário
                const formData = new FormData(this);
                const username = formData.get('username');
                const password = formData.get('password');
                const remember = formData.get('remember') === 'on';
                
                // Validar campos
                let isValid = true;
                
                if (!username.trim()) {
                    showInputError('username', 'Por favor, insira seu usuário ou e-mail');
                    isValid = false;
                } else {
                    clearInputError('username');
                }
                
                if (!password) {
                    showInputError('password', 'Por favor, insira sua senha');
                    isValid = false;
                } else {
                    clearInputError('password');
                }
                
                if (!isValid) {
                    showToast('Por favor, corrija os erros no formulário', 'error');
                    return;
                }
                
                // Simular envio de formulário
                simulateLogin(username, password, remember);
            });
        }
        
        // Validação do formulário de cadastro
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Coletar dados do formulário
                const formData = new FormData(this);
                const name = formData.get('registerName');
                const email = formData.get('registerEmail');
                const password = formData.get('registerPassword');
                const terms = formData.get('terms') === 'on';
                
                // Validar campos
                let isValid = true;
                
                if (!name.trim()) {
                    showInputError('registerName', 'Por favor, insira seu nome completo');
                    isValid = false;
                } else {
                    clearInputError('registerName');
                }
                
                if (!email.trim()) {
                    showInputError('registerEmail', 'Por favor, insira seu e-mail');
                    isValid = false;
                } else if (!isValidEmail(email)) {
                    showInputError('registerEmail', 'Por favor, insira um e-mail válido');
                    isValid = false;
                } else {
                    clearInputError('registerEmail');
                }
                
                if (!password) {
                    showInputError('registerPassword', 'Por favor, crie uma senha');
                    isValid = false;
                } else if (password.length < 8) {
                    showInputError('registerPassword', 'A senha deve ter pelo menos 8 caracteres');
                    isValid = false;
                } else {
                    clearInputError('registerPassword');
                }
                
                if (!terms) {
                    showToast('Você precisa aceitar os termos de serviço', 'error');
                    isValid = false;
                }
                
                if (!isValid) {
                    return;
                }
                
                // Simular cadastro
                simulateRegistration(name, email, password);
            });
        }
        
        // Validação em tempo real
        const inputs = document.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldId = field.id;
        
        switch(fieldId) {
            case 'username':
                if (!value) {
                    showInputError(fieldId, 'Usuário ou e-mail é obrigatório');
                } else {
                    clearInputError(fieldId);
                }
                break;
                
            case 'password':
                if (!value) {
                    showInputError(fieldId, 'Senha é obrigatória');
                } else {
                    clearInputError(fieldId);
                }
                break;
                
            case 'registerName':
                if (!value) {
                    showInputError(fieldId, 'Nome completo é obrigatório');
                } else if (value.length < 3) {
                    showInputError(fieldId, 'Nome deve ter pelo menos 3 caracteres');
                } else {
                    clearInputError(fieldId);
                }
                break;
                
            case 'registerEmail':
                if (!value) {
                    showInputError(fieldId, 'E-mail é obrigatório');
                } else if (!isValidEmail(value)) {
                    showInputError(fieldId, 'Por favor, insira um e-mail válido');
                } else {
                    clearInputError(fieldId);
                }
                break;
                
            case 'registerPassword':
                if (!value) {
                    showInputError(fieldId, 'Senha é obrigatória');
                } else if (value.length < 8) {
                    showInputError(fieldId, 'Senha deve ter pelo menos 8 caracteres');
                } else {
                    clearInputError(fieldId);
                }
                break;
        }
    }
    
    function showInputError(fieldId, message) {
        const inputGroup = document.getElementById(fieldId).closest('.input-group');
        const feedback = inputGroup.querySelector('.input-feedback');
        
        inputGroup.classList.add('invalid');
        inputGroup.classList.remove('valid');
        feedback.textContent = message;
    }
    
    function clearInputError(fieldId) {
        const inputGroup = document.getElementById(fieldId).closest('.input-group');
        const feedback = inputGroup.querySelector('.input-feedback');
        
        inputGroup.classList.remove('invalid');
        inputGroup.classList.remove('valid');
        feedback.textContent = '';
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Comprimento mínimo
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Diversidade de caracteres
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return Math.min(strength, 5); // Máximo de 5
    }
    
    function updatePasswordStrengthIndicator(strength) {
        let percentage = (strength / 5) * 100;
        let strengthText = 'fraca';
        let color = '#EF4444'; // Vermelho
        
        if (strength >= 4) {
            strengthText = 'forte';
            color = '#10B981'; // Verde
        } else if (strength >= 2) {
            strengthText = 'média';
            color = '#F59E0B'; // Amarelo
        }
        
        // Atualizar barra
        strengthBar.style.width = `${percentage}%`;
        strengthBar.style.backgroundColor = color;
        
        // Atualizar texto
        strengthValue.textContent = strengthText;
        strengthValue.style.color = color;
    }
    
    function showRegisterForm() {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        state.isRegisterVisible = true;
        
        // Focar no primeiro campo
        const firstInput = registerForm.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
        
        // Atualizar URL (sem recarregar a página)
        history.pushState({ form: 'register' }, '', '#register');
        
        showToast('Formulário de cadastro ativado', 'info');
    }
    
    function showLoginForm() {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        state.isRegisterVisible = false;
        
        // Focar no primeiro campo
        const firstInput = loginForm.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
        
        // Atualizar URL (sem recarregar a página)
        history.pushState({ form: 'login' }, '', '#login');
        
        showToast('Formulário de login ativado', 'info');
    }
    
    function simulateLogin(username, password, remember) {
        // Mostrar estado de carregamento
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Autenticando...';
        submitButton.disabled = true;
        
        // Simular atraso de rede
        setTimeout(() => {
            // Credenciais de exemplo para demonstração
            const validCredentials = (
                (username === 'admin@masteredu.com' && password === 'Admin123!') ||
                (username === 'professor' && password === 'Professor123!') ||
                (username === 'aluno' && password === 'Aluno123!') ||
                (username === 'demo' && password === 'Demo123!')
            );
            
            if (validCredentials) {
                // Salvar credenciais se "lembrar-me" estiver marcado
                if (remember) {
                    localStorage.setItem('rememberedUser', username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                
                // Mostrar mensagem de sucesso
                showToast('Login realizado com sucesso! Redirecionando...', 'success');
                
                // Simular redirecionamento
                setTimeout(() => {
                    // Em um sistema real, aqui você redirecionaria para o dashboard
                    // window.location.href = '/dashboard';
                    showToast('Redirecionamento simulado. Em produção, você seria direcionado ao painel.', 'success');
                    
                    // Restaurar botão
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                }, 2000);
            } else {
                // Mostrar erro
                showToast('Credenciais inválidas. Tente novamente.', 'error');
                
                // Restaurar botão
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        }, 1500);
    }
    
    function simulateRegistration(name, email, password) {
        // Mostrar estado de carregamento
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
        submitButton.disabled = true;
        
        // Simular atraso de rede
        setTimeout(() => {
            // Verificar se o e-mail já está em uso (simulação)
            const existingUsers = JSON.parse(localStorage.getItem('masterEduUsers') || '[]');
            const userExists = existingUsers.some(user => user.email === email);
            
            if (userExists) {
                showToast('Este e-mail já está em uso. Tente fazer login.', 'error');
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                return;
            }
            
            // Salvar novo usuário (em um sistema real, isso seria feito no servidor)
            const newUser = {
                name,
                email,
                password: '***' // Nunca armazene senhas em texto claro no localStorage
            };
            
            existingUsers.push(newUser);
            localStorage.setItem('masterEduUsers', JSON.stringify(existingUsers));
            
            // Mostrar mensagem de sucesso
            showToast('Conta criada com sucesso! Redirecionando para o login...', 'success');
            
            // Voltar para o formulário de login após um tempo
            setTimeout(() => {
                showLoginForm();
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                // Preencher automaticamente o campo de e-mail no login
                const usernameInput = document.getElementById('username');
                if (usernameInput) {
                    usernameInput.value = email;
                }
            }, 2000);
        }, 2000);
    }
    
    function showToast(message, type = 'info') {
        // Remover toast anterior
        toast.classList.remove('show');
        
        // Configurar nova mensagem
        toast.textContent = message;
        
        // Configurar cor baseada no tipo
        toast.style.backgroundColor = getToastColor(type);
        
        // Mostrar toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Ocultar toast após 5 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
    
    function getToastColor(type) {
        switch(type) {
            case 'success': return '#10B981'; // Verde
            case 'error': return '#EF4444'; // Vermelho
            case 'warning': return '#F59E0B'; // Amarelo
            default: return '#3B82F6'; // Azul (info)
        }
    }
    
    function restoreFormState() {
        // Verificar se há um usuário lembrado
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            const usernameInput = document.getElementById('username');
            const rememberCheckbox = document.getElementById('remember');
            
            if (usernameInput) {
                usernameInput.value = rememberedUser;
            }
            
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
        
        // Verificar se há uma função selecionada
        const selectedRole = localStorage.getItem('selectedRole');
        if (selectedRole) {
            const roleOption = document.querySelector(`.role-option[data-role="${selectedRole}"]`);
            if (roleOption) {
                document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('active'));
                roleOption.classList.add('active');
            }
        }
        
        // Verificar hash da URL para determinar qual formulário mostrar
        if (window.location.hash === '#register') {
            showRegisterForm();
        }
    }
    
    function toggleMobileMenu() {
        if (brandPanel.style.display === 'block') {
            brandPanel.style.display = 'none';
        } else {
            brandPanel.style.display = 'block';
            brandPanel.style.animation = 'slideIn 0.3s ease forwards';
        }
    }
    
    // Tratar navegação pelo botão voltar/avançar do navegador
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.form === 'register') {
            showRegisterForm();
        } else {
            showLoginForm();
        }
    });
    
    // Inicializar com base no hash da URL
    if (window.location.hash === '#register') {
        showRegisterForm();
    }
});