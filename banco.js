// banco.js - Sistema CRUD Firebase para Master Edu
// Usando Firebase SDK v9+ (Modular)

// ===== CONFIGURAÇÃO DO FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyDPPbSA8SB-L_giAhWIqGbPGSMRBDTPi40",
  authDomain: "master-ecossistemaprofessor.firebaseapp.com",
  databaseURL: "https://master-ecossistemaprofessor-default-rtdb.firebaseio.com",
  projectId: "master-ecossistemaprofessor",
  storageBucket: "master-ecossistemaprofessor.firebasestorage.app",
  messagingSenderId: "532224860209",
  appId: "1:532224860209:web:686657b6fae13b937cf510",
  measurementId: "G-B0KMX4E67D"
};

// ===== INICIALIZAÇÃO DO FIREBASE =====
// IMPORTANTE: Para usar o SDK modular, você precisa incluir os scripts do Firebase v9+ no HTML
// Exemplo: <script type="module" src="banco.js"></script>

let app, db, auth, analytics, firestore;

try {
  // Compatibilidade com Firebase v8 (compat) - versão atual do código
  if (typeof firebase !== 'undefined' && firebase.app) {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    firestore = firebase.firestore();
    auth = firebase.auth();
    
    // Analytics é opcional
    try {
      analytics = firebase.analytics();
    } catch (e) {
      console.warn('Analytics não disponível:', e.message);
    }
    
    console.log('✅ Firebase inicializado com sucesso (v8 compat)');
  } else {
    console.error('Firebase não encontrado. Certifique-se de incluir os SDKs do Firebase.');
    console.log('Adicione no HTML: <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>');
    console.log('Adicione no HTML: <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>');
    console.log('Adicione no HTML: <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>');
  }
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

// ===== CONSTANTES DE REFERÊNCIA =====
const DB_PATHS = {
  PROFESSORES: 'professores',
  AULAS: 'aulas',
  RELATORIOS: 'relatorios',
  FINANCEIRO: 'financeiro',
  NOTIFICACOES: 'notificacoes',
  CONFIGURACOES: 'configuracoes'
};

// ===== FUNÇÕES DE AUTENTICAÇÃO =====
const AuthService = {
  // Login com email/senha
  async login(email, senha) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, senha);
      console.log('✅ Login realizado:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Login com CPF (simulado para compatibilidade com sistema atual)
  async loginWithCPF(cpf, dataNascimento) {
    try {
      // Verificar se Firebase está disponível
      if (!auth) {
        throw new Error('Firebase não está inicializado');
      }
      
      // Limpar CPF (remover caracteres não numéricos)
      const cpfLimpo = cpf.replace(/\D/g, '');
      
      // Converter data de nascimento para formato de senha (DDMMAAAA)
      let dataSemBarras;
      if (dataNascimento.includes('/')) {
        // Formato DD/MM/AAAA
        dataSemBarras = dataNascimento.replace(/\D/g, '');
      } else {
        // Já está no formato DDMMAAAA
        dataSemBarras = dataNascimento;
      }
      
      const email = `${cpfLimpo}@masteredu.com.br`;
      const senha = dataSemBarras;
      
      console.log('Tentando login com:', email);
      return await this.login(email, senha);
    } catch (error) {
      console.error('Erro no loginWithCPF:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      await auth.signOut();
      console.log('✅ Logout realizado');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Verificar se usuário está logado
  getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Criar usuário (para administradores)
  async criarUsuario(email, senha, dadosAdicionais = {}) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
      
      // Atualizar perfil do usuário
      await userCredential.user.updateProfile({
        displayName: dadosAdicionais.nome || '',
        photoURL: dadosAdicionais.foto || ''
      });

      // Salvar dados adicionais no Realtime Database
      if (Object.keys(dadosAdicionais).length > 0) {
        await db.ref(`${DB_PATHS.PROFESSORES}/${userCredential.user.uid}`).set({
          ...dadosAdicionais,
          email: email,
          criadoEm: firebase.database.ServerValue.TIMESTAMP
        });
      }

      console.log('✅ Usuário criado:', email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// ===== FUNÇÕES CRUD PARA PROFESSORES =====
const ProfessorService = {
  // Buscar professor por CPF
  async buscarPorCPF(cpf) {
    try {
      const snapshot = await db.ref(DB_PATHS.PROFESSORES)
        .orderByChild('cpf')
        .equalTo(cpf)
        .once('value');
      
      if (snapshot.exists()) {
        const dados = snapshot.val();
        const chave = Object.keys(dados)[0];
        return { 
          id: chave, 
          ...dados[chave],
          success: true 
        };
      }
      return { success: false, error: 'Professor não encontrado' };
    } catch (error) {
      console.error('❌ Erro ao buscar professor:', error);
      return { success: false, error: error.message };
    }
  },

  // Buscar professor por ID
  async buscarPorId(id) {
    try {
      const snapshot = await db.ref(`${DB_PATHS.PROFESSORES}/${id}`).once('value');
      
      if (snapshot.exists()) {
        return { 
          id: id,
          ...snapshot.val(),
          success: true 
        };
      }
      return { success: false, error: 'Professor não encontrado' };
    } catch (error) {
      console.error('❌ Erro ao buscar professor:', error);
      return { success: false, error: error.message };
    }
  },

  // Listar todos os professores
  async listarTodos() {
    try {
      const snapshot = await db.ref(DB_PATHS.PROFESSORES).once('value');
      
      if (snapshot.exists()) {
        const professores = [];
        snapshot.forEach(childSnapshot => {
          professores.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return { success: true, data: professores };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Erro ao listar professores:', error);
      return { success: false, error: error.message };
    }
  },

  // Criar novo professor
  async criar(professorData) {
    try {
      // Verificar se CPF já existe
      const cpfExistente = await this.buscarPorCPF(professorData.cpf);
      if (cpfExistente.success) {
        return { success: false, error: 'CPF já cadastrado' };
      }

      const novoProfessorRef = db.ref(DB_PATHS.PROFESSORES).push();
      const professorId = novoProfessorRef.key;
      
      const dadosCompletos = {
        ...professorData,
        criadoEm: firebase.database.ServerValue.TIMESTAMP,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP,
        status: 'ativo'
      };

      await novoProfessorRef.set(dadosCompletos);
      
      console.log('✅ Professor criado:', professorId);
      return { 
        success: true, 
        id: professorId,
        data: dadosCompletos 
      };
    } catch (error) {
      console.error('❌ Erro ao criar professor:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar professor
  async atualizar(id, professorData) {
    try {
      const dadosAtualizados = {
        ...professorData,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP
      };

      await db.ref(`${DB_PATHS.PROFESSORES}/${id}`).update(dadosAtualizados);
      
      console.log('✅ Professor atualizado:', id);
      return { success: true, id: id };
    } catch (error) {
      console.error('❌ Erro ao atualizar professor:', error);
      return { success: false, error: error.message };
    }
  },

  // Deletar professor (soft delete)
  async deletar(id) {
    try {
      await db.ref(`${DB_PATHS.PROFESSORES}/${id}`).update({
        status: 'inativo',
        deletadoEm: firebase.database.ServerValue.TIMESTAMP
      });
      
      console.log('✅ Professor marcado como inativo:', id);
      return { success: true, id: id };
    } catch (error) {
      console.error('❌ Erro ao deletar professor:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar saldo da carteira
  async atualizarSaldoCarteira(id, valor) {
    try {
      await db.ref(`${DB_PATHS.PROFESSORES}/${id}/financeiro`).update({
        saldoCarteira: valor,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP
      });
      
      console.log('✅ Saldo atualizado:', id, valor);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar saldo:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar saldo previsto
  async atualizarSaldoPrevisto(id, valor) {
    try {
      await db.ref(`${DB_PATHS.PROFESSORES}/${id}/financeiro`).update({
        saldoPrevisto: valor,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP
      });
      
      console.log('✅ Saldo previsto atualizado:', id, valor);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar saldo previsto:', error);
      return { success: false, error: error.message };
    }
  }
};

// ===== FUNÇÕES CRUD PARA AULAS =====
const AulaService = {
  // Buscar aula por ID
  async buscarPorId(id) {
    try {
      const snapshot = await db.ref(`${DB_PATHS.AULAS}/${id}`).once('value');
      
      if (snapshot.exists()) {
        return { 
          id: id,
          ...snapshot.val(),
          success: true 
        };
      }
      return { success: false, error: 'Aula não encontrada' };
    } catch (error) {
      console.error('❌ Erro ao buscar aula:', error);
      return { success: false, error: error.message };
    }
  },

  // Listar aulas com filtros
  async listar(filtros = {}) {
    try {
      let query = db.ref(DB_PATHS.AULAS);
      
      // Aplicar filtros
      if (filtros.professorId) {
        query = query.orderByChild('professorId').equalTo(filtros.professorId);
      }
      
      if (filtros.status) {
        query = query.orderByChild('status').equalTo(filtros.status);
      }
      
      if (filtros.data) {
        query = query.orderByChild('data').equalTo(filtros.data);
      }

      const snapshot = await query.once('value');
      
      if (snapshot.exists()) {
        const aulas = [];
        snapshot.forEach(childSnapshot => {
          aulas.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Ordenar por data e hora
        aulas.sort((a, b) => {
          const dataA = `${a.data} ${a.hora}`;
          const dataB = `${b.data} ${b.hora}`;
          return dataA.localeCompare(dataB);
        });

        return { success: true, data: aulas };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Erro ao listar aulas:', error);
      return { success: false, error: error.message };
    }
  },

  // Criar nova aula
  async criar(aulaData) {
    try {
      const novaAulaRef = db.ref(DB_PATHS.AULAS).push();
      const aulaId = novaAulaRef.key;
      
      const dadosCompletos = {
        ...aulaData,
        criadoEm: firebase.database.ServerValue.TIMESTAMP,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP,
        status: 'pendente',
        check: false,
        relatorio: false
      };

      await novaAulaRef.set(dadosCompletos);
      
      console.log('✅ Aula criada:', aulaId);
      return { 
        success: true, 
        id: aulaId,
        data: dadosCompletos 
      };
    } catch (error) {
      console.error('❌ Erro ao criar aula:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar aula
  async atualizar(id, aulaData) {
    try {
      const dadosAtualizados = {
        ...aulaData,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP
      };

      await db.ref(`${DB_PATHS.AULAS}/${id}`).update(dadosAtualizados);
      
      console.log('✅ Aula atualizada:', id);
      return { success: true, id: id };
    } catch (error) {
      console.error('❌ Erro ao atualizar aula:', error);
      return { success: false, error: error.message };
    }
  },

  // Deletar aula
  async deletar(id) {
    try {
      await db.ref(`${DB_PATHS.AULAS}/${id}`).remove();
      
      console.log('✅ Aula deletada:', id);
      return { success: true, id: id };
    } catch (error) {
      console.error('❌ Erro ao deletar aula:', error);
      return { success: false, error: error.message };
    }
  },

  // Marcar aula como concluída
  async marcarConcluida(id, dadosConclusao = {}) {
    try {
      await db.ref(`${DB_PATHS.AULAS}/${id}`).update({
        status: 'concluida',
        check: true,
        concluidaEm: firebase.database.ServerValue.TIMESTAMP,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP,
        ...dadosConclusao
      });
      
      console.log('✅ Aula marcada como concluída:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao marcar aula como concluída:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancelar aula
  async cancelar(id, motivo = '') {
    try {
      await db.ref(`${DB_PATHS.AULAS}/${id}`).update({
        status: 'cancelada',
        canceladoEm: firebase.database.ServerValue.TIMESTAMP,
        motivoCancelamento: motivo,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP
      });
      
      console.log('✅ Aula cancelada:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao cancelar aula:', error);
      return { success: false, error: error.message };
    }
  },

  // Listar aulas por professor
  async listarPorProfessor(professorId, filtros = {}) {
    return await this.listar({ professorId, ...filtros });
  },

  // Listar aulas de hoje
  async listarAulasHoje(professorId) {
    const hoje = new Date().toLocaleDateString('pt-BR');
    return await this.listarPorProfessor(professorId, { data: hoje });
  },

  // Listar próximas aulas
  async listarProximasAulas(professorId) {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const aulas = await this.listarPorProfessor(professorId, { status: 'confirmada' });
    
    if (aulas.success) {
      const proximas = aulas.data.filter(aula => {
        const [dia, mes, ano] = aula.data.split('/');
        const dataAula = new Date(ano, mes - 1, dia);
        const hojeObj = new Date();
        
        // Verificar se a aula é futura
        return dataAula >= hojeObj.setHours(0, 0, 0, 0);
      });
      
      return { success: true, data: proximas };
    }
    
    return aulas;
  }
};

// ===== FUNÇÕES CRUD PARA RELATÓRIOS =====
const RelatorioService = {
  // Criar relatório para aula
  async criarRelatorio(aulaId, relatorioData) {
    try {
      const relatorioRef = db.ref(`${DB_PATHS.RELATORIOS}/${aulaId}`);
      
      const dadosCompletos = {
        ...relatorioData,
        aulaId: aulaId,
        criadoEm: firebase.database.ServerValue.TIMESTAMP,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP
      };

      await relatorioRef.set(dadosCompletos);
      
      // Atualizar status da aula
      await AulaService.atualizar(aulaId, { relatorio: true });
      
      console.log('✅ Relatório criado para aula:', aulaId);
      return { success: true, aulaId: aulaId };
    } catch (error) {
      console.error('❌ Erro ao criar relatório:', error);
      return { success: false, error: error.message };
    }
  },

  // Buscar relatório por aula
  async buscarPorAula(aulaId) {
    try {
      const snapshot = await db.ref(`${DB_PATHS.RELATORIOS}/${aulaId}`).once('value');
      
      if (snapshot.exists()) {
        return { 
          aulaId: aulaId,
          ...snapshot.val(),
          success: true 
        };
      }
      return { success: false, error: 'Relatório não encontrado' };
    } catch (error) {
      console.error('❌ Erro ao buscar relatório:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar relatório
  async atualizarRelatorio(aulaId, relatorioData) {
    try {
      const dadosAtualizados = {
        ...relatorioData,
        atualizadoEm: firebase.database.ServerValue.TIMESTAMP
      };

      await db.ref(`${DB_PATHS.RELATORIOS}/${aulaId}`).update(dadosAtualizados);
      
      console.log('✅ Relatório atualizado para aula:', aulaId);
      return { success: true, aulaId: aulaId };
    } catch (error) {
      console.error('❌ Erro ao atualizar relatório:', error);
      return { success: false, error: error.message };
    }
  }
};

// ===== FUNÇÕES DE NOTIFICAÇÃO =====
const NotificacaoService = {
  // Enviar notificação para professor
  async enviarNotificacao(professorId, notificacaoData) {
    try {
      const notificacaoRef = db.ref(`${DB_PATHS.NOTIFICACOES}/${professorId}`).push();
      const notificacaoId = notificacaoRef.key;
      
      const dadosCompletos = {
        ...notificacaoData,
        id: notificacaoId,
        professorId: professorId,
        lida: false,
        enviadaEm: firebase.database.ServerValue.TIMESTAMP
      };

      await notificacaoRef.set(dadosCompletos);
      
      console.log('✅ Notificação enviada:', notificacaoId);
      return { success: true, id: notificacaoId };
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      return { success: false, error: error.message };
    }
  },

  // Marcar notificação como lida
  async marcarComoLida(professorId, notificacaoId) {
    try {
      await db.ref(`${DB_PATHS.NOTIFICACOES}/${professorId}/${notificacaoId}`).update({
        lida: true,
        lidaEm: firebase.database.ServerValue.TIMESTAMP
      });
      
      console.log('✅ Notificação marcada como lida:', notificacaoId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      return { success: false, error: error.message };
    }
  },

  // Listar notificações do professor
  async listarPorProfessor(professorId, apenasNaoLidas = false) {
    try {
      let query = db.ref(`${DB_PATHS.NOTIFICACOES}/${professorId}`).orderByChild('enviadaEm');
      
      const snapshot = await query.once('value');
      
      if (snapshot.exists()) {
        const notificacoes = [];
        snapshot.forEach(childSnapshot => {
          const notificacao = {
            id: childSnapshot.key,
            ...childSnapshot.val()
          };
          
          if (!apenasNaoLidas || !notificacao.lida) {
            notificacoes.push(notificacao);
          }
        });
        
        // Ordenar por data (mais recente primeiro)
        notificacoes.sort((a, b) => b.enviadaEm - a.enviadaEm);
        
        return { success: true, data: notificacoes };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Erro ao listar notificações:', error);
      return { success: false, error: error.message };
    }
  }
};

// ===== FUNÇÕES UTILITÁRIAS =====
const Utils = {
  // Formatar data para o sistema
  formatarData(data) {
    if (!data) return '';
    
    if (data instanceof Date) {
      return data.toLocaleDateString('pt-BR');
    }
    
    // Tentar converter string para data
    try {
      const [dia, mes, ano] = data.split(/[\/-]/);
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    } catch (error) {
      return data;
    }
  },

  // Formatar valor monetário
  formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  },

  // Validar CPF
  validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    // Validar segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  },

  // Gerar ID único
  gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Converter objeto para query string
  objetoParaQueryString(obj) {
    return Object.keys(obj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  }
};

// ===== EXPORTAÇÃO DAS FUNÇÕES =====
window.MasterEduDB = {
  // Serviços
  Auth: AuthService,
  Professores: ProfessorService,
  Aulas: AulaService,
  Relatorios: RelatorioService,
  Notificacoes: NotificacaoService,
  
  // Utilitários
  Utils: Utils,
  
  // Referências do Firebase (para uso avançado)
  firebase: firebase,
  db: db,
  auth: auth,
  
  // Configurações
  config: firebaseConfig,
  
  // Função para testar conexão
  async testarConexao() {
    try {
      const testRef = db.ref('teste_conexao');
      await testRef.set({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        mensagem: 'Teste de conexão realizado com sucesso'
      });
      
      console.log('✅ Conexão com Firebase estabelecida com sucesso');
      return { success: true, message: 'Conexão estabelecida' };
    } catch (error) {
      console.error('❌ Erro na conexão com Firebase:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Inicializar o sistema
  async inicializar() {
    try {
      console.log('🔄 Inicializando sistema MasterEduDB...');
      
      // Testar conexão
      const conexao = await this.testarConexao();
      if (!conexao.success) {
        throw new Error('Falha na conexão com Firebase');
      }
      
      // Configurar listener de autenticação
      auth.onAuthStateChanged(user => {
        if (user) {
          console.log('👤 Usuário autenticado:', user.email);
          window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user } }));
        } else {
          console.log('👤 Usuário não autenticado');
          window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user: null } }));
        }
      });
      
      console.log('✅ MasterEduDB inicializado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao inicializar MasterEduDB:', error);
      return { success: false, error: error.message };
    }
  }
};

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', async function() {
  // Verificar se Firebase está disponível
  if (typeof firebase === 'undefined') {
    console.error('Firebase não carregado. Inclua os scripts do Firebase antes do banco.js');
    return;
  }
  
  // Inicializar o sistema
  await MasterEduDB.inicializar();
});

// Expor globalmente para acesso em outros scripts
window.MasterEduDB = MasterEduDB;
console.log('MasterEduDB disponível globalmente em window.MasterEduDB');