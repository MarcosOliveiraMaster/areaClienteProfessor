// professores.js - Sistema de Gestão de Professores

// ===== DADOS DE EXEMPLO (simulando o banco de dados) =====
const dataBaseProfessores = [
    {
        nome: "Amanda Lais Lins Praxedes",
        cpf: "09622371400",
        dataNascimento: "20/02/2005",
        saldoCarteira: 1250.00,
        saldoPrevisto: 2800.00
    },
    {
        nome: "Ana Victória Moreira Alves da Silva",
        cpf: "06991927570",
        dataNascimento: "08/03/2006",
        saldoCarteira: 980.00,
        saldoPrevisto: 2200.00
    },
    // ... outros professores do seu banco de dados
];

const dataBaseAulas = [
    {
        id: 1,
        data: "15/11/2023",
        nomeCliente: "Maria Silva",
        aluno: "João Silva",
        hora: "09:00",
        duracao: "60 min",
        status: "confirmada",
        valor: 150.00,
        check: false,
        relatorio: false
    },
    {
        id: 2,
        data: "15/11/2023",
        nomeCliente: "José Santos",
        aluno: "Ana Santos",
        hora: "11:00",
        duracao: "90 min",
        status: "pendente",
        valor: 200.00,
        check: false,
        relatorio: false
    },
    {
        id: 3,
        data: "16/11/2023",
        nomeCliente: "Carlos Oliveira",
        aluno: "Pedro Oliveira",
        hora: "14:00",
        duracao: "60 min",
        status: "concluida",
        valor: 150.00,
        check: true,
        relatorio: true
    },
    {
        id: 4,
        data: "17/11/2023",
        nomeCliente: "Patrícia Costa",
        aluno: "Mariana Costa",
        hora: "16:30",
        duracao: "120 min",
        status: "confirmada",
        valor: 300.00,
        check: false,
        relatorio: false
    },
    {
        id: 5,
        data: "18/11/2023",
        nomeCliente: "Roberto Alves",
        aluno: "Lucas Alves",
        hora: "10:00",
        duracao: "60 min",
        status: "pendente",
        valor: 150.00,
        check: false,
        relatorio: false
    },
    {
        id: 6,
        data: "20/11/2023",
        nomeCliente: "Fernanda Lima",
        aluno: "Gabriela Lima",
        hora: "15:00",
        duracao: "90 min",
        status: "cancelada",
        valor: 200.00,
        check: false,
        relatorio: false
    }
];

// ===== ESTADO DA APLICAÇÃO =====
const AppState = {
    professorLogado: null,
    aulas: [...dataBaseAulas],
    aulaSelecionada: null,
    aulaPendenteSwitch: null,
    filtroData: null
};

// ===== ELEMENTOS DOM =====
const DOM = {
    // Elementos principais
    professorNome: document.getElementById('professorNome'),
    walletValue: document.getElementById('walletValue'),
    monthValue: document.getElementById('monthValue'),
    lastAccess: document.getElementById('lastAccess'),
    
    // Elementos das abas
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Tabela
    aulasTableBody: document.getElementById('aulasTableBody'),
    
    // Filtros
    dateFilter: document.getElementById('dateFilter'),
    
    // Botões
    logoutBtn: document.getElementById('logoutBtn'),
    comunicacaoBtn: document.getElementById('comunicacaoBtn'),
    driveBtn: document.getElementById('driveBtn'),
    indiqueBtn: document.getElementById('indiqueBtn'),
    
    // Modal de Confirmação de Aula
    confirmAulaModal: document.getElementById('confirmAulaModal'),
    confirmAulaYes: document.getElementById('confirmAulaYes'),
    confirmAulaNo: document.getElementById('confirmAulaNo'),
    
    // Modal de Relatório
    relatorioModal: document.getElementById('relatorioModal'),
    modalClose: document.querySelector('.modal-close'),
    modalCancel: document.querySelector('.modal-cancel'),
    modalSave: document.querySelector('.modal-save'),
    relatorioConteudo: document.getElementById('relatorioConteudo'),
    relatorioObservacoes: document.getElementById('relatorioObservacoes')
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Professores iniciado');
    
    // Verificar se há professor logado
    const professorLogado = localStorage.getItem('professorLogado');
    
    if (!professorLogado) {
        // Se não houver professor logado, redirecionar para login
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar dados do professor
    loadProfessorData(professorLogado);
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar aulas
    loadAulas();
    
    // Atualizar data atual no filtro
    const hoje = new Date().toISOString().split('T')[0];
    DOM.dateFilter.value = hoje;
    
    // Adicionar log
    console.log('Sistema de professores carregado com sucesso');
});

// ===== CARREGAR DADOS DO PROFESSOR =====
function loadProfessorData(professorData) {
    try {
        const professor = JSON.parse(professorData);
        AppState.professorLogado = professor;
        
        // Buscar informações financeiras no banco de dados
        const professorBD = dataBaseProfessores.find(p => p.cpf === professor.cpf);
        
        if (professorBD) {
            // Atualizar dados na tela
            DOM.professorNome.textContent = `Bem vindo, ${professorBD.nome}`;
            DOM.walletValue.textContent = formatCurrency(professorBD.saldoCarteira);
            DOM.monthValue.textContent = formatCurrency(professorBD.saldoPrevisto);
            
            // Atualizar último acesso
            const agora = new Date();
            DOM.lastAccess.textContent = `Hoje às ${agora.getHours()}:${agora.getMinutes().toString().padStart(2, '0')}`;
            
            console.log(`Dados carregados para: ${professorBD.nome}`);
        } else {
            // Caso não encontre no banco, usar dados do login
            DOM.professorNome.textContent = `Bem vindo, ${professor.nome}`;
        }
    } catch (error) {
        console.error('Erro ao carregar dados do professor:', error);
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Tabs
    DOM.tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Filtro de data
    DOM.dateFilter.addEventListener('change', function() {
        const dataSelecionada = this.value;
        AppState.filtroData = dataSelecionada ? formatDateToBR(dataSelecionada) : null;
        loadAulas();
    });
    
    // Logout
    DOM.logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Botões do footer
    DOM.comunicacaoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showComunicacao();
    });
    
    DOM.driveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showDrive();
    });
    
    DOM.indiqueBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showIndicacao();
    });
    
    // Modal
    DOM.modalClose.addEventListener('click', closeModal);
    DOM.modalCancel.addEventListener('click', closeModal);
    DOM.modalSave.addEventListener('click', saveRelatorio);
    
    // Modal de Confirmação de Aula
    DOM.confirmAulaYes.addEventListener('click', confirmAulaConcluida);
    DOM.confirmAulaNo.addEventListener('click', closeConfirmAulaModal);
    
    // Fechar modal clicando fora
    window.addEventListener('click', function(e) {
        if (e.target === DOM.relatorioModal) {
            closeModal();
        }
        if (e.target === DOM.confirmAulaModal) {
            closeConfirmAulaModal();
        }
    });
}

// ===== FUNÇÕES DE TAB =====
function switchTab(tabId) {
    // Remover classe active de todas as tabs
    DOM.tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabId) {
            tab.classList.add('active');
        }
    });
    
    // Remover classe active de todos os conteúdos
    DOM.tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });
    
    // Recarregar aulas com o filtro da tab
    loadAulas();
}

// ===== CARREGAR AULAS =====
function loadAulas() {
    const tabAtiva = document.querySelector('.tab.active').dataset.tab;
    let aulasFiltradas = [...AppState.aulas];
    
    // Aplicar filtro de data se existir
    if (AppState.filtroData) {
        aulasFiltradas = aulasFiltradas.filter(aula => aula.data === AppState.filtroData);
    }
    
    // Aplicar filtro da tab
    switch(tabAtiva) {
        case 'hoje':
            const hojeBR = new Date().toLocaleDateString('pt-BR');
            aulasFiltradas = aulasFiltradas.filter(aula => aula.data === hojeBR);
            break;
            
        case 'futuras':
            const hoje = new Date();
            aulasFiltradas = aulasFiltradas.filter(aula => {
                const [dia, mes, ano] = aula.data.split('/');
                const dataAula = new Date(ano, mes - 1, dia);
                return dataAula > hoje;
            });
            break;
            
        case 'concluidas':
            aulasFiltradas = aulasFiltradas.filter(aula => aula.status === 'concluida');
            break;
            
        case 'todas':
        default:
            // Nenhum filtro adicional
            break;
    }
    
    // Ordenar por data e hora
    aulasFiltradas.sort((a, b) => {
        const [diaA, mesA, anoA] = a.data.split('/');
        const [diaB, mesB, anoB] = b.data.split('/');
        const dataA = new Date(anoA, mesA - 1, diaA);
        const dataB = new Date(anoB, mesB - 1, diaB);
        
        if (dataA.getTime() !== dataB.getTime()) {
            return dataA - dataB;
        }
        
        return a.hora.localeCompare(b.hora);
    });
    
    // Renderizar tabela
    renderAulasTable(aulasFiltradas);
}

// ===== RENDERIZAR TABELA =====
function renderAulasTable(aulas) {
    if (!DOM.aulasTableBody) return;
    
    DOM.aulasTableBody.innerHTML = '';
    
    if (aulas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="7" style="text-align: center; padding: var(--space-xl); color: var(--gray);">
                <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: var(--space-sm); display: block;"></i>
                Sem aulas agendadas
            </td>
        `;
        DOM.aulasTableBody.appendChild(tr);
        return;
    }
    
    aulas.forEach(aula => {
        const tr = document.createElement('tr');
        
        // Botões de ação
        const reportBtnText = aula.relatorio ? 'Ver' : 'Confirmar';
        const reportBtnClass = aula.relatorio ? 'btn-report' : 'btn-report';
        
        tr.innerHTML = `
            <td>${aula.data}</td>
            <td><strong>${aula.nomeCliente}</strong></td>
            <td>${aula.aluno}</td>
            <td>${aula.hora}</td>
            <td>${aula.duracao}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${aula.check ? 'checked' : ''} data-id="${aula.id}" data-action="toggle-concluida">
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <button class="btn-action ${reportBtnClass}" data-id="${aula.id}" data-action="report">
                    <i class="fas ${aula.relatorio ? 'fa-file-alt' : 'fa-plus-circle'}"></i>
                    ${reportBtnText}
                </button>
            </td>
        `;
        
        DOM.aulasTableBody.appendChild(tr);
    });
    
    // Adicionar event listeners aos botões da tabela
    addTableEventListeners();
}

// ===== EVENT LISTENERS DA TABELA =====
function addTableEventListeners() {
    // Switch de aula concluída
    document.querySelectorAll('[data-action="toggle-concluida"]').forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            e.preventDefault();
            const aulaId = parseInt(this.dataset.id);
            const novoEstado = this.checked;
            
            // Reverter o estado do checkbox temporariamente
            this.checked = !novoEstado;
            
            // Armazenar referência para confirmação
            AppState.aulaPendenteSwitch = { aulaId, novoEstado, checkbox: this };
            
            // Abrir modal de confirmação
            openConfirmAulaModal();
        });
    });
    
    // Botão de relatório
    document.querySelectorAll('[data-action="report"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const aulaId = parseInt(this.dataset.id);
            openRelatorioModal(aulaId);
        });
    });
}

// ===== FUNÇÕES DE AULA =====
function toggleCheckAula(aulaId) {
    const aulaIndex = AppState.aulas.findIndex(a => a.id === aulaId);
    if (aulaIndex === -1) return;
    
    const aula = AppState.aulas[aulaIndex];
    
    if (!aula.check) {
        // Marcar como concluída
        if (confirm(`Deseja marcar a aula de ${aula.aluno} como concluída?`)) {
            AppState.aulas[aulaIndex].check = true;
            AppState.aulas[aulaIndex].status = 'concluida';
            loadAulas();
            showNotification('Aula marcada como concluída!', 'success');
        }
    }
}

function editAula(aulaId) {
    const aula = AppState.aulas.find(a => a.id === aulaId);
    if (!aula) return;
    
    alert(`Editar aula de ${aula.aluno}\n\nFuncionalidade em desenvolvimento.`);
}

function cancelAula(aulaId) {
    const aula = AppState.aulas.find(a => a.id === aulaId);
    if (!aula) return;
    
    if (confirm(`Tem certeza que deseja cancelar a aula de ${aula.aluno}?`)) {
        const aulaIndex = AppState.aulas.findIndex(a => a.id === aulaId);
        AppState.aulas[aulaIndex].status = 'cancelada';
        loadAulas();
        showNotification('Aula cancelada com sucesso!', 'warning');
    }
}

// ===== FUNÇÕES DO MODAL =====
function openRelatorioModal(aulaId) {
    const aula = AppState.aulas.find(a => a.id === aulaId);
    if (!aula) return;
    
    AppState.aulaSelecionada = aula;
    
    // Preencher modal com dados existentes se houver
    if (aula.relatorio) {
        // Se já existe relatório, apenas mostrar mensagem
        alert(`Relatório já criado para ${aula.aluno}\n\nFuncionalidade de visualização em desenvolvimento.`);
        return;
    }
    
    // Limpar campos
    DOM.relatorioConteudo.value = '';
    DOM.relatorioObservacoes.value = '';
    
    // Mostrar modal
    DOM.relatorioModal.classList.add('show');
}

function closeModal() {
    DOM.relatorioModal.classList.remove('show');
    AppState.aulaSelecionada = null;
}

// ===== FUNÇÕES DO MODAL DE CONFIRMAÇÃO =====
function openConfirmAulaModal() {
    DOM.confirmAulaModal.classList.add('show');
}

function closeConfirmAulaModal() {
    DOM.confirmAulaModal.classList.remove('show');
    AppState.aulaPendenteSwitch = null;
}

function confirmAulaConcluida() {
    if (!AppState.aulaPendenteSwitch) {
        closeConfirmAulaModal();
        return;
    }
    
    const { aulaId, novoEstado } = AppState.aulaPendenteSwitch;
    
    // Atualizar aula no estado
    const aulaIndex = AppState.aulas.findIndex(a => a.id === aulaId);
    if (aulaIndex !== -1) {
        AppState.aulas[aulaIndex].check = novoEstado;
        if (novoEstado) {
            AppState.aulas[aulaIndex].status = 'concluida';
        }
    }
    
    closeConfirmAulaModal();
    loadAulas();
    
    if (novoEstado) {
        showNotification('Aula marcada como concluída!', 'success');
    } else {
        showNotification('Aula desmarcada como concluída', 'info');
    }
}

function saveRelatorio() {
    if (!AppState.aulaSelecionada) {
        closeModal();
        return;
    }
    
    const conteudo = DOM.relatorioConteudo.value.trim();
    const observacoes = DOM.relatorioObservacoes.value.trim();
    
    if (!conteudo) {
        alert('Por favor, preencha o conteúdo da aula.');
        return;
    }
    
    // Atualizar aula no estado
    const aulaIndex = AppState.aulas.findIndex(a => a.id === AppState.aulaSelecionada.id);
    if (aulaIndex !== -1) {
        AppState.aulas[aulaIndex].relatorio = true;
        // Em um sistema real, aqui salvaríamos o conteúdo do relatório
    }
    
    closeModal();
    loadAulas();
    showNotification('Relatório salvo com sucesso!', 'success');
}

// ===== FUNÇÕES DOS BOTÕES DO FOOTER =====
function showComunicacao() {
    alert('Sistema de Comunicação\n\nFuncionalidade em desenvolvimento.');
}

function showDrive() {
    alert('Acesso ao Drive\n\nFuncionalidade em desenvolvimento.');
}

function showIndicacao() {
    const indicacao = prompt('Digite o nome e telefone do professor para indicar:');
    if (indicacao) {
        showNotification('Indicação enviada com sucesso! Obrigado.', 'success');
    }
}

// ===== FUNÇÕES UTILITÁRIAS =====
function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        localStorage.removeItem('professorLogado');
        window.location.href = 'index.html';
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDateToBR(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
        color: white;
        padding: var(--space-md) var(--space-lg);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Adicionar animações CSS para as notificações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== EXPORT PARA DEBUG =====
window.ProfessoresApp = {
    state: AppState,
    reloadAulas: loadAulas,
    addAula: function(aula) {
        aula.id = AppState.aulas.length + 1;
        AppState.aulas.push(aula);
        loadAulas();
    }
};