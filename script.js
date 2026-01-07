// script.js - Sistema de Login Local com JSON

// ===== DADOS DOS PROFESSORES (JSON) =====
const professores = [
    {
        nome: "Amanda Lais Lins Praxedes",
        cpf: "09622371400",
        dataNascimento: "20/02/2005",
        dataSemBarras: "20022005"
    },
    {
        nome: "Ana Victória Moreira Alves da Silva",
        cpf: "06991927570",
        dataNascimento: "08/03/2006",
        dataSemBarras: "08032006"
    },
    {
        nome: "Pâmela Abigail da Silva Melo",
        cpf: "09049132448", // Corrigido para 11 dígitos
        dataNascimento: "24/11/2000",
        dataSemBarras: "24112000"
    },
    {
        nome: "Anna Letícya Medeiros Cavalcanti Cabral",
        cpf: "14116866407",
        dataNascimento: "29/01/2005",
        dataSemBarras: "29012005"
    },
    {
        nome: "Auana Raiana da Silva Andrade",
        cpf: "11819143457",
        dataNascimento: "18/06/2002",
        dataSemBarras: "18062002"
    },
    {
        nome: "Emily Cinthia de Oliveira",
        cpf: "13434558470",
        dataNascimento: "29/11/2001",
        dataSemBarras: "29112001"
    },
    {
        nome: "Erica Maria Carvalho de Oliveira",
        cpf: "12318293465",
        dataNascimento: "06/01/1999",
        dataSemBarras: "06011999"
    },
    {
        nome: "Erika Araujo Vieira",
        cpf: "06567790474",
        dataNascimento: "02/12/2002",
        dataSemBarras: "02122002"
    },
    {
        nome: "Evelyn Maria da Silva Alves",
        cpf: "11107722462",
        dataNascimento: "22/12/2005",
        dataSemBarras: "22122005"
    },
    {
        nome: "Gabriel Londres Arlota",
        cpf: "10609155709",
        dataNascimento: "11/02/1993",
        dataSemBarras: "11021993"
    },
    {
        nome: "Isabella de Oliveira Jorge Ferreira",
        cpf: "11443153443",
        dataNascimento: "19/01/1999",
        dataSemBarras: "19011999"
    },
    {
        nome: "Jaciara Maria Pereira da Silva",
        cpf: "13525783442",
        dataNascimento: "13/07/2002",
        dataSemBarras: "13072002"
    },
    {
        nome: "João Daniel Simões dos Santos Silva",
        cpf: "12339995400",
        dataNascimento: "10/06/2005",
        dataSemBarras: "10062005"
    },
    {
        nome: "José Aragão de Lima Junior",
        cpf: "07689447406", // Corrigido para 11 dígitos
        dataNascimento: "07/07/2025",
        dataSemBarras: "07072025"
    },
    {
        nome: "José Wellington da Silva Correia",
        cpf: "09090485414",
        dataNascimento: "14/07/1992",
        dataSemBarras: "14071992"
    },
    {
        nome: "Kamilla Melo Da Silva",
        cpf: "06501392403",
        dataNascimento: "20/02/2003",
        dataSemBarras: "20022003"
    },
    {
        nome: "Kariny Melo da Silva",
        cpf: "12018328450",
        dataNascimento: "09/03/2004",
        dataSemBarras: "09032004"
    },
    {
        nome: "Louis Filipe Lima Mota",
        cpf: "09127773469",
        dataNascimento: "01/08/2005",
        dataSemBarras: "01082005"
    },
    {
        nome: "Lucas Gabriel Santos Lima",
        cpf: "10186129475",
        dataNascimento: "17/01/2001",
        dataSemBarras: "17012001"
    },
    {
        nome: "Marcos Lucas da Silva Oliveira",
        cpf: "07167714461", // Corrigido para 11 dígitos
        dataNascimento: "15/11/1996",
        dataSemBarras: "15111996"
    },
    {
        nome: "Maria Eduarda dos Santos Rodrigues de Melo",
        cpf: "13907652452",
        dataNascimento: "04/03/2005",
        dataSemBarras: "04032005"
    },
    {
        nome: "Noemi de Castro Torres",
        cpf: "09948169441",
        dataNascimento: "25/05/1996",
        dataSemBarras: "25051996"
    },
    {
        nome: "Pablo Vitor da Silva Nascimento",
        cpf: "13236789484",
        dataNascimento: "17/05/2003",
        dataSemBarras: "17052003"
    },
    {
        nome: "Pedro Joaquim de Omena Neto",
        cpf: "13749016445",
        dataNascimento: "16/05/2000",
        dataSemBarras: "16052000"
    },
    {
        nome: "Pedro Victor Mendonça Uchôa",
        cpf: "09370869409",
        dataNascimento: "29/07/1997",
        dataSemBarras: "29071997"
    },
    {
        nome: "Rubens Patrick Barros Oliveira",
        cpf: "12071361407",
        dataNascimento: "04/06/2005",
        dataSemBarras: "04062005"
    },
    {
        nome: "Thuane Ingred Azevedo Barbosa",
        cpf: "11221284444",
        dataNascimento: "04/09/1997",
        dataSemBarras: "04091997"
    },
    {
        nome: "Willian Pereira dos Santos",
        cpf: "08330987485",
        dataNascimento: "17/01/1992",
        dataSemBarras: "17011992"
    },
    {
        nome: "Reigileide Vieira Ferraz",
        cpf: "05423574536",
        dataNascimento: "23/10/1996",
        dataSemBarras: "23101996"
    }
];

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
    // Salvar dados do professor logado
    localStorage.setItem('professorLogado', JSON.stringify(professor));
    
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