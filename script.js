// script.js - Sistema de Login Local com JSON
// Os dados dos professores estão em login.js

// ===== ESTADO DA APLICAÇÃO =====
const AppState = {
    debugMode: false,
    logs: []
};

// ===== ELEMENTOS DOM =====
const DOM = {
    // Formulário
    loginForm: document.getElementById('loginForm'),
    
    // Inputs
    cpfInput: document.getElementById('cpf'),
    senhaInput: document.getElementById('senha'),
    
    // Resultado
    resultContainer: document.getElementById('resultContainer'),
    resultIcon: document.getElementById('resultIcon'),
    resultTitle: document.getElementById('resultTitle'),
    resultText: document.getElementById('resultText'),
    
    // Debug
    debugPanel: document.querySelector('.debug-panel'),
    logContainer: document.getElementById('logContainer'),
    debugToggle: document.getElementById('debugToggle'),
    reloadBtn: document.getElementById('reloadBtn'),
    ajudaLink: document.getElementById('ajudaLink'),
    
    // Stats
    totalProfessores: document.getElementById('totalProfessores')
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Login Local iniciado');
    
    // Atualizar contador de professores
    if (DOM.totalProfessores) {
        DOM.totalProfessores.textContent = professores.length;
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar dados salvos
    loadSavedData();
    
    // Adicionar log inicial
    addLog('Sistema iniciado com sucesso');
    addLog(`Total de professores: ${professores.length}`);
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Formulário de login
    if (DOM.loginForm) {
        DOM.loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Máscara para CPF (apenas números)
    if (DOM.cpfInput) {
        DOM.cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            e.target.value = value;
        });
    }
    
    // Máscara para senha (apenas números)
    if (DOM.senhaInput) {
        DOM.senhaInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.substring(0, 8);
            e.target.value = value;
        });
    }
    
    // Debug toggle
    if (DOM.debugToggle) {
        DOM.debugToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDebug();
        });
    }
    
    // Recarregar
    if (DOM.reloadBtn) {
        DOM.reloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            location.reload();
        });
    }
    
    // Ajuda
    if (DOM.ajudaLink) {
        DOM.ajudaLink.addEventListener('click', function(e) {
            e.preventDefault();
            showHelp();
        });
    }
}

// ===== FUNÇÃO PRINCIPAL: LOGIN =====
function handleLogin() {
    // Limpar resultado anterior
    hideResult();
    
    // Obter valores
    const cpf = DOM.cpfInput.value.trim();
    const senha = DOM.senhaInput.value.trim();
    
    // Validar
    if (!validateInput(cpf, senha)) {
        return;
    }
    
    // Buscar professor
    const professor = buscarProfessor(cpf, senha);
    
    // Adicionar log
    addLog(`Tentativa de login - CPF: ${cpf}, Senha: ${senha}`);
    
    if (professor) {
        // Login bem-sucedido
        addLog(`✅ Login bem-sucedido: ${professor.nome}`);
        showSuccess(professor);
        
        // Salvar dados se "lembrar" estiver marcado
        if (document.getElementById('lembrar').checked) {
            saveUserData(cpf, senha);
        }
    } else {
        // Login falhou
        addLog('❌ Login falhou - Credenciais incorretas');
        showError();
    }
}

// ===== VALIDAÇÃO =====
function validateInput(cpf, senha) {
    let isValid = true;
    
    // Limpar erros
    clearErrors();
    
    // Validar CPF
    if (!cpf) {
        showError('cpfError', 'CPF é obrigatório');
        isValid = false;
    } else if (cpf.length !== 11) {
        showError('cpfError', 'CPF deve ter exatamente 11 dígitos');
        isValid = false;
    } else if (!/^\d+$/.test(cpf)) {
        showError('cpfError', 'CPF deve conter apenas números');
        isValid = false;
    }
    
    // Validar senha
    if (!senha) {
        showError('senhaError', 'Data de nascimento é obrigatória');
        isValid = false;
    } else if (senha.length !== 8) {
        showError('senhaError', 'Data deve ter 8 dígitos (DDMMAAAA)');
        isValid = false;
    } else if (!/^\d+$/.test(senha)) {
        showError('senhaError', 'Data deve conter apenas números');
        isValid = false;
    }
    
    return isValid;
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

// ===== BUSCAR PROFESSOR =====
function buscarProfessor(cpf, senha) {
    // Formatar CPF (garantir zeros à esquerda)
    const cpfFormatado = cpf.padStart(11, '0');
    
    // Buscar professor com CPF correspondente
    return professores.find(professor => {
        const professorCpf = professor.cpf.padStart(11, '0');
        const professorSenha = professor.dataSemBarras;
        
        return professorCpf === cpfFormatado && professorSenha === senha;
    });
}

// ===== MOSTRAR RESULTADOS =====
function showSuccess(professor) {
    // Criar variável com o CPF do professor
    const idProfessor_CPF = professor.cpf;
    
    // Imprimir no console
    console.log('id-Professor_CPF:', idProfessor_CPF);
    
    // Salvar dados do professor logado
    localStorage.setItem('professorLogado', JSON.stringify(professor));
    
    // Salvar idProfessor_CPF separadamente
    localStorage.setItem('idProfessor_CPF', idProfessor_CPF);
    
    // Redirecionar para área do professor
    setTimeout(() => {
        window.location.href = 'areaProfessor/professores.html';
    }, 500);
}

function showError() {
    if (!DOM.resultContainer) return;
    
    // Atualizar ícone e cores
    DOM.resultIcon.className = 'fas fa-times-circle';
    DOM.resultContainer.style.borderColor = '#EF4444';
    DOM.resultIcon.style.color = '#EF4444';
    
    // Atualizar texto
    DOM.resultTitle.textContent = 'Login Falhou';
    DOM.resultText.textContent = 'CPF ou data de nascimento incorretos. Verifique os dados e tente novamente.';
    
    // Mostrar resultado
    DOM.resultContainer.classList.remove('hidden');
    
    // Limpar campo de senha
    DOM.senhaInput.value = '';
    DOM.senhaInput.focus();
}

function hideResult() {
    if (DOM.resultContainer) {
        DOM.resultContainer.classList.add('hidden');
    }
}

// ===== FUNÇÕES UTILITÁRIAS =====
function formatCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function saveUserData(cpf, senha) {
    const userData = {
        cpf: cpf,
        senha: senha,
        timestamp: Date.now()
    };
    
    localStorage.setItem('masterEduUser', JSON.stringify(userData));
    addLog('Dados do usuário salvos localmente');
}

function loadSavedData() {
    try {
        const savedData = localStorage.getItem('masterEduUser');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            const cacheAge = Date.now() - data.timestamp;
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias
            
            if (cacheAge < maxAge) {
                if (DOM.cpfInput) DOM.cpfInput.value = data.cpf;
                if (DOM.senhaInput) DOM.senhaInput.value = data.senha;
                document.getElementById('lembrar').checked = true;
                
                addLog('Dados do usuário carregados do cache');
                return true;
            } else {
                localStorage.removeItem('masterEduUser');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
    }
    
    return false;
}

// ===== DEBUG FUNCTIONS =====
function toggleDebug() {
    AppState.debugMode = !AppState.debugMode;
    
    if (DOM.debugPanel) {
        if (AppState.debugMode) {
            DOM.debugPanel.classList.remove('hidden');
            DOM.debugToggle.textContent = 'Esconder Debug';
            addLog('Modo debug ativado');
        } else {
            DOM.debugPanel.classList.add('hidden');
            DOM.debugToggle.textContent = 'Debug';
        }
    }
}

function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
        time: timestamp,
        message: message
    };
    
    AppState.logs.push(logEntry);
    
    // Limitar logs a 50 entradas
    if (AppState.logs.length > 50) {
        AppState.logs.shift();
    }
    
    updateLogDisplay();
}

function updateLogDisplay() {
    if (!DOM.logContainer || !AppState.debugMode) return;
    
    DOM.logContainer.innerHTML = '';
    
    AppState.logs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.textContent = `[${log.time}] ${log.message}`;
        DOM.logContainer.appendChild(div);
    });
    
    // Rolagem automática para o final
    DOM.logContainer.scrollTop = DOM.logContainer.scrollHeight;
}

function showHelp() {
    const ajuda = `
    <strong>Instruções de Uso:</strong><br>
    1. Digite seu CPF completo (11 dígitos)<br>
    2. Digite sua data de nascimento sem barras (DDMMAAAA)<br>
    3. Clique em "Verificar Acesso"<br><br>
    
    <strong>Exemplos:</strong><br>
    • Data 20/02/2005 = 20022005<br>
    • Data 08/03/2006 = 08032006<br>
    • Data 24/11/2000 = 24112000<br><br>
    
    <strong>Problemas comuns:</strong><br>
    • CPF deve ter 11 dígitos (adicionar zeros à esquerda se necessário)<br>
    • Data deve ter 8 dígitos (sem barras)<br>
    • Use apenas números
    `;
    
    alert(ajuda);
}

// ===== EXPORT PARA DEBUG =====
window.MasterEdu = {
    professores: professores,
    buscarProfessor: buscarProfessor,
    limparCache: function() {
        localStorage.removeItem('masterEduUser');
        addLog('Cache limpo');
        alert('Cache limpo com sucesso!');
    },
    testarLogin: function(cpf, senha) {
        DOM.cpfInput.value = cpf;
        DOM.senhaInput.value = senha;
        handleLogin();
    },
    mostrarTodos: function() {
        console.table(professores.map(p => ({
            Nome: p.nome,
            CPF: p.cpf,
            'Data com /': p.dataNascimento,
            'Data sem /': p.dataSemBarras
        })));
    }
};

// Adicionar alguns logs iniciais
setTimeout(() => {
    addLog('Sistema pronto para uso');
    addLog('Digite CPF e senha para testar');
}, 100);