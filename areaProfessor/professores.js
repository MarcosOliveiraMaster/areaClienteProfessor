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

const dataBaseAulas = [];

// ===== ESTADO DA APLICAÇÃO =====
const AppState = {
    professorLogado: null,
    idProfessor_CPF: null, // Armazenar CPF do professor logado
    aulas: [...dataBaseAulas],
    aulaSelecionada: null,
    aulaPendenteSwitch: null,
    filtroData: null,
    filtroMes: null // {mes: 0-11, ano: 2026}
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
    clearDateBtn: document.getElementById('clearDateBtn'),
    monthFilterBtn: document.getElementById('monthFilterBtn'),
    monthDropdown: document.getElementById('monthDropdown'),
    
    // Botões
    crachaVirtualBtn: document.getElementById('crachaVirtualBtn'),
    estatisticasBtn: document.getElementById('estatisticasBtn'),
    
    // Botões
    logoutBtn: document.getElementById('logoutBtn'),
    comunicacaoBtn: document.getElementById('comunicacaoBtn'),
    driveBtn: document.getElementById('driveBtn'),
    indiqueBtn: document.getElementById('indiqueBtn'),
    
    // Modal de Confirmação de Aula
    confirmAulaModal: document.getElementById('confirmAulaModal'),
    confirmAulaYes: document.getElementById('confirmAulaYes'),
    confirmAulaNo: document.getElementById('confirmAulaNo'),
    
    // Modal de Relatório Antigo (remover depois)
    relatorioModal: document.getElementById('relatorioModal'),
    modalClose: document.querySelector('.modal-close'),
    modalCancel: document.querySelector('.modal-cancel'),
    modalSave: document.querySelector('.modal-save'),
    relatorioConteudo: document.getElementById('relatorioConteudo'),
    relatorioObservacoes: document.getElementById('relatorioObservacoes'),
    
    // Novos Modais de Relatório
    relatorioViewModal: document.getElementById('relatorioViewModal'),
    relatorioEditModal: document.getElementById('relatorioEditModal'),
    
    // Elementos do modal de visualização
    viewDescricao: document.getElementById('viewDescricao'),
    viewComportamento: document.getElementById('viewComportamento'),
    viewRecomendacoes: document.getElementById('viewRecomendacoes'),
    viewDataEnvio: document.getElementById('viewDataEnvio'),
    btnFecharView: document.getElementById('btnFecharView'),
    btnEditarView: document.getElementById('btnEditarView'),
    
    // Elementos do modal de edição
    editDescricao: document.getElementById('editDescricao'),
    editComportamento: document.getElementById('editComportamento'),
    editRecomendacoes: document.getElementById('editRecomendacoes'),
    btnCancelarEdit: document.getElementById('btnCancelarEdit'),
    btnEnviarRelatorio: document.getElementById('btnEnviarRelatorio')
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
        
        // Recuperar idProfessor_CPF do localStorage
        const idProfessor_CPF = localStorage.getItem('idProfessor_CPF');
        
        // Armazenar no AppState para uso durante toda a sessão
        AppState.idProfessor_CPF = idProfessor_CPF;
        
        // Imprimir no console
        console.log('id-Professor_CPF:', idProfessor_CPF);
        console.log('Variável mantida em AppState.idProfessor_CPF:', AppState.idProfessor_CPF);
        
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
        
        // Buscar aulas do professor no Firestore
        buscarAulasProfessor(idProfessor_CPF);
        
    } catch (error) {
        console.error('Erro ao carregar dados do professor:', error);
    }
}

// ===== CALCULAR VALOR DO MÊS ATUAL =====
function calcularValorMesAtual() {
    try {
        // Obter primeiro e último dia do mês atual
        const hoje = new Date();
        const mesAtual = hoje.getMonth(); // 0-11
        const anoAtual = hoje.getFullYear();
        
        const primeiroDia = new Date(anoAtual, mesAtual, 1);
        const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
        
        console.log('📅 Calculando valor do mês:', `${mesAtual + 1}/${anoAtual}`);
        console.log('📅 Período:', primeiroDia.toLocaleDateString('pt-BR'), 'até', ultimoDia.toLocaleDateString('pt-BR'));
        
        let valorTotal = 0;
        let aulasContadas = 0;
        
        // Percorrer todas as aulas
        AppState.aulas.forEach(aula => {
            if (!aula.data) return;
            
            // Extrair data do formato "ddd - dd/mm/yyyy"
            const partesData = aula.data.split(' - ');
            if (partesData.length < 2) return;
            
            const dataStr = partesData[1]; // dd/mm/yyyy
            const [dia, mes, ano] = dataStr.split('/').map(Number);
            
            // Criar objeto Date para a aula
            const dataAula = new Date(ano, mes - 1, dia);
            
            // Verificar se a aula está dentro do mês atual
            if (dataAula >= primeiroDia && dataAula <= ultimoDia) {
                // Verificar se existe o campo ValorAula e somar
                const valorAula = aula.ValorAula || 0;
                valorTotal += valorAula;
                aulasContadas++;
                
                console.log(`  ✓ Aula ${aula.data}: R$ ${valorAula.toFixed(2)}`);
            }
        });
        
        console.log(`💰 Total de aulas no mês: ${aulasContadas}`);
        console.log(`💰 Valor total do mês: R$ ${valorTotal.toFixed(2)}`);
        
        // Atualizar o valor na tela
        DOM.monthValue.textContent = formatCurrency(valorTotal);
        
        return valorTotal;
        
    } catch (error) {
        console.error('❌ Erro ao calcular valor do mês:', error);
        return 0;
    }
}

// ===== CALCULAR VALOR DA CARTEIRA (AULAS CONCLUÍDAS DO MÊS) =====
function calcularValorCarteira() {
    try {
        // Obter primeiro e último dia do mês atual
        const hoje = new Date();
        const mesAtual = hoje.getMonth(); // 0-11
        const anoAtual = hoje.getFullYear();
        
        const primeiroDia = new Date(anoAtual, mesAtual, 1);
        const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
        
        console.log('💳 Calculando valor da carteira (aulas concluídas):', `${mesAtual + 1}/${anoAtual}`);
        
        let valorTotal = 0;
        let aulasConcluidas = 0;
        
        // Percorrer todas as aulas
        AppState.aulas.forEach(aula => {
            if (!aula.data) return;
            
            // Extrair data do formato "ddd - dd/mm/yyyy"
            const partesData = aula.data.split(' - ');
            if (partesData.length < 2) return;
            
            const dataStr = partesData[1]; // dd/mm/yyyy
            const [dia, mes, ano] = dataStr.split('/').map(Number);
            
            // Criar objeto Date para a aula
            const dataAula = new Date(ano, mes - 1, dia);
            
            // Verificar se a aula está dentro do mês atual E se está concluída
            if (dataAula >= primeiroDia && dataAula <= ultimoDia) {
                const statusAula = aula.statusAula || '';
                
                // Verificar se o status é "Aula Concluída"
                if (statusAula === 'Aula Concluída') {
                    const valorAula = aula.ValorAula || 0;
                    valorTotal += valorAula;
                    aulasConcluidas++;
                    
                    console.log(`  ✓ Aula concluída ${aula.data}: R$ ${valorAula.toFixed(2)}`);
                }
            }
        });
        
        console.log(`💳 Total de aulas concluídas: ${aulasConcluidas}`);
        console.log(`💳 Valor da carteira: R$ ${valorTotal.toFixed(2)}`);
        
        // Atualizar o valor na tela
        DOM.walletValue.textContent = formatCurrency(valorTotal);
        
        return valorTotal;
        
    } catch (error) {
        console.error('❌ Erro ao calcular valor da carteira:', error);
        return 0;
    }
}

// ===== BUSCAR AULAS DO PROFESSOR NO FIRESTORE =====
async function buscarAulasProfessor(idProfessor_CPF) {
    try {
        if (!idProfessor_CPF) {
            console.error('❌ idProfessor_CPF não encontrado');
            return;
        }
        
        // Verificar se o Firestore está disponível
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.error('❌ Firestore não está disponível');
            return;
        }
        
        const firestore = firebase.firestore();
        
        console.log('🔍 Buscando aulas para o professor:', idProfessor_CPF);
        
        // Buscar documentos na coleção "BancoDeAulas-Lista" onde idProfessor = idProfessor_CPF
        const snapshot = await firestore.collection('BancoDeAulas-Lista')
            .where('idProfessor', '==', idProfessor_CPF)
            .get();
        
        if (snapshot.empty) {
            console.log('ℹ️ Nenhuma aula encontrada para este professor');
            AppState.aulas = [];
            loadAulas();
            return;
        }
        
        console.log('═══════════════════════════════════════════════════');
        console.log('TabelaAulas');
        console.log('═══════════════════════════════════════════════════');
        
        // Array para armazenar as aulas
        const aulasArray = [];
        
        // Iterar sobre os documentos encontrados
        snapshot.forEach((doc) => {
            const data = doc.data();
            const docId = doc.id;
            
            // Criar uma string com todas as informações separadas por ";"
            const campos = [];
            campos.push(`ID_Documento: ${docId}`);
            
            // Adicionar todos os campos do documento
            Object.keys(data).forEach(key => {
                campos.push(`${key}: ${data[key]}`);
            });
            
            // Exibir no console
            console.log(campos.join(' ; '));
            
            // Adicionar aula ao array com estrutura para a tabela
            aulasArray.push({
                id: docId,
                idAula: data['id-Aula'] || '',
                data: data.data || '',
                nomeCliente: data.nomeCliente || data.cliente || '',
                aluno: data.estudante || '',
                hora: data.horario || '',
                duracao: data.duracao || '',
                statusAula: data.StatusAula || '',
                check: data.ConfirmacaoProfessorAula === true || data.ConfirmacaoProfessorAula === 'true',
                relatorio: false, // Deixar em branco por enquanto
                ValorAula: data.ValorAula || 0, // Valor da aula
                RelatorioAula: data.RelatorioAula || '' // Relatório da aula
            });
        });
        
        console.log('═══════════════════════════════════════════════════');
        console.log(`✅ Total de aulas encontradas: ${snapshot.size}`);
        
        // Atualizar AppState com as aulas do Firestore
        AppState.aulas = aulasArray;
        
        // Recarregar a tabela com os novos dados
        loadAulas();
        
        // Calcular e atualizar o valor do mês atual
        calcularValorMesAtual();
        
        // Calcular e atualizar o valor da carteira (aulas concluídas)
        calcularValorCarteira();
        
    } catch (error) {
        console.error('❌ Erro ao buscar aulas do professor:', error);
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
        if (dataSelecionada) {
            // Converter data do input (yyyy-mm-dd) para formato BR (dd/mm/yyyy)
            const [ano, mes, dia] = dataSelecionada.split('-');
            AppState.filtroData = `${dia}/${mes}/${ano}`;
            
            // Mostrar botão de limpar
            if (DOM.clearDateBtn) DOM.clearDateBtn.classList.remove('hidden');
        } else {
            AppState.filtroData = null;
            
            // Esconder botão de limpar
            if (DOM.clearDateBtn) DOM.clearDateBtn.classList.add('hidden');
        }
        loadAulas();
    });
    
    // Botão de limpar filtro de data
    if (DOM.clearDateBtn) {
        DOM.clearDateBtn.addEventListener('click', function() {
            DOM.dateFilter.value = '';
            AppState.filtroData = null;
            AppState.filtroMes = null;
            this.classList.add('hidden');
            
            // Remover seleção ativa dos meses
            if (DOM.monthDropdown) {
                DOM.monthDropdown.querySelectorAll('.month-option').forEach(opt => {
                    opt.classList.remove('active');
                });
            }
            
            loadAulas();
        });
    }
    
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
    
    // Botão Crachá Virtual
    if (DOM.crachaVirtualBtn) {
        DOM.crachaVirtualBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Funcionalidade será implementada futuramente
            showNotification('Funcionalidade em desenvolvimento', 'info');
        });
    }
    
    // Botão Estatísticas
    if (DOM.estatisticasBtn) {
        DOM.estatisticasBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Funcionalidade será implementada futuramente
            showNotification('Funcionalidade em desenvolvimento', 'info');
        });
    }
    
    // Filtro de Mês
    if (DOM.monthFilterBtn) {
        DOM.monthFilterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            DOM.monthDropdown.classList.toggle('hidden');
        });
    }
    
    // Opções do dropdown de mês
    if (DOM.monthDropdown) {
        const monthOptions = DOM.monthDropdown.querySelectorAll('.month-option');
        monthOptions.forEach(option => {
            option.addEventListener('click', function() {
                const mesIndex = parseInt(this.dataset.month);
                const anoAtual = new Date().getFullYear();
                
                // Definir filtro de mês
                AppState.filtroMes = { mes: mesIndex, ano: anoAtual };
                
                // Limpar filtro de data
                DOM.dateFilter.value = '';
                AppState.filtroData = null;
                if (DOM.clearDateBtn) DOM.clearDateBtn.classList.add('hidden');
                
                // Marcar opção ativa
                monthOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Fechar dropdown
                DOM.monthDropdown.classList.add('hidden');
                
                // Recarregar aulas
                loadAulas();
            });
        });
    }
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function(e) {
        if (DOM.monthDropdown && !DOM.monthDropdown.classList.contains('hidden')) {
            if (!e.target.closest('.month-filter')) {
                DOM.monthDropdown.classList.add('hidden');
            }
        }
    });
    
    // Modal antigo (manter por compatibilidade)
    DOM.modalClose.addEventListener('click', closeModal);
    DOM.modalCancel.addEventListener('click', closeModal);
    DOM.modalSave.addEventListener('click', saveRelatorio);
    
    // Novos modais de relatório
    if (DOM.btnFecharView) DOM.btnFecharView.addEventListener('click', closeRelatorioViewModal);
    if (DOM.btnEditarView) DOM.btnEditarView.addEventListener('click', openRelatorioEditModalFromView);
    if (DOM.btnCancelarEdit) DOM.btnCancelarEdit.addEventListener('click', closeRelatorioEditModal);
    if (DOM.btnEnviarRelatorio) DOM.btnEnviarRelatorio.addEventListener('click', salvarRelatorioAula);
    
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
        if (e.target === DOM.relatorioViewModal) {
            closeRelatorioViewModal();
        }
        if (e.target === DOM.relatorioEditModal) {
            closeRelatorioEditModal();
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
    
    // Aplicar filtro de data específica (tem prioridade)
    if (AppState.filtroData) {
        aulasFiltradas = aulasFiltradas.filter(aula => {
            if (!aula.data) return false;
            const partesData = aula.data.includes(' - ') ? aula.data.split(' - ')[1] : aula.data;
            return partesData === AppState.filtroData;
        });
    }
    // Aplicar filtro de mês selecionado
    else if (AppState.filtroMes) {
        const { mes, ano } = AppState.filtroMes;
        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0);
        
        aulasFiltradas = aulasFiltradas.filter(aula => {
            if (!aula.data) return false;
            
            const partesData = aula.data.includes(' - ') ? aula.data.split(' - ')[1] : aula.data;
            const [dia, mesStr, anoStr] = partesData.split('/');
            const dataAula = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(dia));
            
            return dataAula >= primeiroDia && dataAula <= ultimoDia;
        });
    }
    // Filtro padrão para tab "Todas as Aulas" (sem filtro manual)
    else if (tabAtiva === 'todas') {
        const hoje = new Date();
        const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        
        aulasFiltradas = aulasFiltradas.filter(aula => {
            if (!aula.data) return false;
            
            const partesData = aula.data.includes(' - ') ? aula.data.split(' - ')[1] : aula.data;
            const [dia, mes, ano] = partesData.split('/');
            const dataAula = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            
            return dataAula >= primeiroDiaMesAtual;
        });
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
    
    // Ordenar por data e hora (ordem crescente - mais antiga primeiro)
    aulasFiltradas.sort((a, b) => {
        // Extrair data do formato "ddd - dd/mm/yyyy"
        const partesDataA = a.data.includes(' - ') ? a.data.split(' - ')[1] : a.data;
        const partesDataB = b.data.includes(' - ') ? b.data.split(' - ')[1] : b.data;
        
        const [diaA, mesA, anoA] = partesDataA.split('/');
        const [diaB, mesB, anoB] = partesDataB.split('/');
        const dataA = new Date(anoA, mesA - 1, diaA);
        const dataB = new Date(anoB, mesB - 1, diaB);
        
        if (dataA.getTime() !== dataB.getTime()) {
            return dataA - dataB; // Ordem crescente
        }
        
        return a.hora.localeCompare(b.hora); // Hora também em ordem crescente
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
        
        // Verificar se existe relatório
        const temRelatorio = aula.RelatorioAula && aula.RelatorioAula.trim() !== '';
        const iconColor = temRelatorio ? '#28a745' : '#6c757d'; // Verde se tem, cinza se não tem
        
        // Exibir apenas primeiro e segundo nome do cliente
        const nomeClienteAbreviado = aula.nomeCliente 
            ? aula.nomeCliente.split(' ').slice(0, 2).join(' ') 
            : '-';
        
        // Determinar classe CSS baseada no statusAula
        let statusClass = '';
        const statusAulaLower = (aula.statusAula || '').toLowerCase();
        if (statusAulaLower.includes('concluída') || statusAulaLower.includes('concluida')) {
            statusClass = 'status-concluida';
        } else if (statusAulaLower.includes('reagendada')) {
            statusClass = 'status-reagendada';
        } else if (statusAulaLower.includes('cancelada')) {
            statusClass = 'status-cancelada';
        } else if (statusAulaLower.includes('reposição') || statusAulaLower.includes('reposicao')) {
            statusClass = 'status-reposicao';
        }
        
        tr.innerHTML = `
            <td>${aula.data || '-'}</td>
            <td><strong>${nomeClienteAbreviado}</strong></td>
            <td>${aula.aluno || '-'}</td>
            <td>${aula.hora || '-'}</td>
            <td>${aula.duracao || '-'}</td>
            <td><span class="status-badge ${statusClass}">${aula.statusAula || '-'}</span></td>
            <td class="hidden-column">${aula.idAula || '-'}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${aula.check ? 'checked' : ''} data-id="${aula.id}" data-id-aula="${aula.idAula}" data-action="toggle-concluida">
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <button class="btn-action btn-report" data-id="${aula.id}" data-action="report" style="background: transparent; border: none; cursor: pointer; font-size: 1.5rem;">
                    <i class="fas fa-comment" style="color: ${iconColor};"></i>
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
            const aulaId = this.dataset.id;
            const idAulaValor = this.dataset.idAula;
            const novoEstado = this.checked;
            
            // Reverter o estado do checkbox temporariamente
            this.checked = !novoEstado;
            
            // Armazenar referência para confirmação
            AppState.aulaPendenteSwitch = { aulaId, idAulaValor, novoEstado, checkbox: this };
            
            // Abrir modal de confirmação
            openConfirmAulaModal();
        });
    });
    
    // Botão de relatório
    document.querySelectorAll('[data-action="report"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const aulaId = this.dataset.id;
            openRelatorioViewModal(aulaId);
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

async function confirmAulaConcluida() {
    if (!AppState.aulaPendenteSwitch) {
        closeConfirmAulaModal();
        return;
    }
    
    const { aulaId, idAulaValor, novoEstado } = AppState.aulaPendenteSwitch;
    
    if (!idAulaValor) {
        showNotification('Erro: ID da aula não encontrado', 'error');
        closeConfirmAulaModal();
        return;
    }
    
    try {
        // Buscar o documento que tem o campo "id-Aula" igual ao valor capturado
        const firestore = firebase.firestore();
        
        const snapshot = await firestore.collection('BancoDeAulas-Lista')
            .where('id-Aula', '==', idAulaValor)
            .get();
        
        if (snapshot.empty) {
            showNotification('Erro: Aula não encontrada no banco de dados', 'error');
            closeConfirmAulaModal();
            return;
        }
        
        // Pegar o primeiro documento encontrado
        const doc = snapshot.docs[0];
        const docId = doc.id;
        
        // Atualizar o campo ConfirmacaoProfessorAula
        await firestore.collection('BancoDeAulas-Lista')
            .doc(docId)
            .update({
                ConfirmacaoProfessorAula: novoEstado
            });
        
        // Atualizar aula no estado local
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
    } catch (error) {
        console.error('Erro ao atualizar aula no Firestore:', error);
        showNotification('Erro ao atualizar aula. Tente novamente.', 'error');
        closeConfirmAulaModal();
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

// ===== FUNÇÕES DO NOVO MODAL DE RELATÓRIO =====

// Abrir modal de visualização do relatório
function openRelatorioViewModal(aulaId) {
    const aula = AppState.aulas.find(a => a.id === aulaId);
    if (!aula) return;
    
    AppState.aulaSelecionada = aula;
    
    // Parse do relatório (formato string com quebras de linha)
    const relatorio = aula.RelatorioAula || '';
    
    if (relatorio.trim() === '') {
        // Se não tem relatório, ir direto para edição
        openRelatorioEditModal(aulaId);
        return;
    }
    
    // Extrair informações do relatório
    const linhas = relatorio.split('\n');
    let descricao = '';
    let comportamento = '';
    let recomendacoes = '';
    let dataEnvio = '';
    
    let secaoAtual = '';
    
    linhas.forEach(linha => {
        if (linha.includes('Descrição da Aula')) {
            secaoAtual = 'descricao';
        } else if (linha.includes('Comportamento do estudante')) {
            secaoAtual = 'comportamento';
        } else if (linha.includes('Recomendações')) {
            secaoAtual = 'recomendacoes';
        } else if (linha.includes('Enviado em:')) {
            dataEnvio = linha.replace('Enviado em:', '').trim();
            secaoAtual = '';
        } else if (linha.trim() !== '' && !linha.includes('---')) {
            if (secaoAtual === 'descricao') descricao += linha + '\n';
            if (secaoAtual === 'comportamento') comportamento += linha + '\n';
            if (secaoAtual === 'recomendacoes') recomendacoes += linha + '\n';
        }
    });
    
    // Preencher campos do modal
    if (DOM.viewDescricao) DOM.viewDescricao.value = descricao.trim();
    if (DOM.viewComportamento) DOM.viewComportamento.value = comportamento.trim();
    if (DOM.viewRecomendacoes) DOM.viewRecomendacoes.value = recomendacoes.trim();
    if (DOM.viewDataEnvio) DOM.viewDataEnvio.textContent = dataEnvio || 'Não informado';
    
    // Mostrar modal
    if (DOM.relatorioViewModal) DOM.relatorioViewModal.classList.add('show');
}

// Fechar modal de visualização
function closeRelatorioViewModal() {
    if (DOM.relatorioViewModal) DOM.relatorioViewModal.classList.remove('show');
    AppState.aulaSelecionada = null;
}

// Abrir modal de edição a partir do modal de visualização
function openRelatorioEditModalFromView() {
    closeRelatorioViewModal();
    
    if (!AppState.aulaSelecionada) return;
    
    openRelatorioEditModal(AppState.aulaSelecionada.id);
}

// Abrir modal de edição do relatório
function openRelatorioEditModal(aulaId) {
    const aula = AppState.aulas.find(a => a.id === aulaId);
    if (!aula) return;
    
    AppState.aulaSelecionada = aula;
    
    // Parse do relatório existente (se houver)
    const relatorio = aula.RelatorioAula || '';
    
    let descricao = '';
    let comportamento = '';
    let recomendacoes = '';
    
    if (relatorio.trim() !== '') {
        const linhas = relatorio.split('\n');
        let secaoAtual = '';
        
        linhas.forEach(linha => {
            if (linha.includes('Descrição da Aula')) {
                secaoAtual = 'descricao';
            } else if (linha.includes('Comportamento do estudante')) {
                secaoAtual = 'comportamento';
            } else if (linha.includes('Recomendações')) {
                secaoAtual = 'recomendacoes';
            } else if (linha.includes('Enviado em:')) {
                secaoAtual = '';
            } else if (linha.trim() !== '' && !linha.includes('---')) {
                if (secaoAtual === 'descricao') descricao += linha + '\n';
                if (secaoAtual === 'comportamento') comportamento += linha + '\n';
                if (secaoAtual === 'recomendacoes') recomendacoes += linha + '\n';
            }
        });
    }
    
    // Preencher campos do modal
    if (DOM.editDescricao) DOM.editDescricao.value = descricao.trim();
    if (DOM.editComportamento) DOM.editComportamento.value = comportamento.trim();
    if (DOM.editRecomendacoes) DOM.editRecomendacoes.value = recomendacoes.trim();
    
    // Mostrar modal
    if (DOM.relatorioEditModal) DOM.relatorioEditModal.classList.add('show');
}

// Fechar modal de edição
function closeRelatorioEditModal() {
    if (DOM.relatorioEditModal) DOM.relatorioEditModal.classList.remove('show');
    AppState.aulaSelecionada = null;
}

// Salvar relatório da aula
async function salvarRelatorioAula() {
    if (!AppState.aulaSelecionada) return;
    
    // Obter valores dos campos
    const descricao = DOM.editDescricao ? DOM.editDescricao.value.trim() : '';
    const comportamento = DOM.editComportamento ? DOM.editComportamento.value.trim() : '';
    const recomendacoes = DOM.editRecomendacoes ? DOM.editRecomendacoes.value.trim() : '';
    
    // Validação: todos campos devem ter pelo menos 1 caractere
    if (descricao === '' || comportamento === '' || recomendacoes === '') {
        showNotification('Todos os campos devem ser preenchidos!', 'error');
        return;
    }
    
    // Obter data e hora atual
    const agora = new Date();
    const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const diaSemana = diasSemana[agora.getDay()];
    const dia = agora.getDate().toString().padStart(2, '0');
    const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    
    const dataEnvio = `${diaSemana} - ${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    
    // Criar string do relatório com quebras de linha
    const relatorioTexto = `Descrição da Aula\n${descricao}\n\n---\n\nComportamento do estudante\n${comportamento}\n\n---\n\nRecomendações\n${recomendacoes}\n\n---\n\nEnviado em: ${dataEnvio}`;
    
    try {
        // Atualizar no Firestore
        const firestore = firebase.firestore();
        
        await firestore.collection('BancoDeAulas-Lista')
            .doc(AppState.aulaSelecionada.id)
            .update({
                RelatorioAula: relatorioTexto
            });
        
        // Atualizar no estado local
        const aulaIndex = AppState.aulas.findIndex(a => a.id === AppState.aulaSelecionada.id);
        if (aulaIndex !== -1) {
            AppState.aulas[aulaIndex].RelatorioAula = relatorioTexto;
        }
        
        // Recarregar tabela
        loadAulas();
        
        // Recalcular valores
        calcularValorMesAtual();
        calcularValorCarteira();
        
        // Fechar modal
        closeRelatorioEditModal();
        
        // Mostrar notificação de sucesso
        showNotification('Relatório salvo com sucesso!', 'success');
        
        console.log('✅ Relatório salvo:', relatorioTexto);
        
    } catch (error) {
        console.error('❌ Erro ao salvar relatório:', error);
        showNotification('Erro ao salvar relatório. Tente novamente.', 'error');
    }
}

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