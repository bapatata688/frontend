import React, { useState, useEffect } from 'react';
import {
  Shield,
  Type,
  Image,
  MousePointer,
  Menu,
  FileText,
  Camera,
  Eye,
  Download,
  Save,
  CreditCard,
  Lock,
  LogIn,
  UserPlus,
  Settings,
  Crown,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  Home,
  User,
  BarChart3,
  Bell,
  Search,
  Grid3X3,
  Star,
  ChevronLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  Zap,
  FileCode,
  Cloud,
  RefreshCw,
  AlertCircle,
  X,
  Check,
  Edit3,
  FolderPlus,
  LogOut,
  Loader2
} from 'lucide-react';
import { authAPI, projectsAPI, elementsAPI, paymentsAPI, statsAPI, dataLoaders, storage, loadUserProfile, loadProjects, loadStats, loadPaymentHistory } from './api/config.js';// Componente principal
const WebShield = () => {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [draggedElements, setDraggedElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);

  const elements = {
    free: [
      { id: 'text', name: 'Texto', icon: Type, type: 'text' },
      { id: 'image', name: 'Imagen', icon: Image, type: 'image' },
      { id: 'button', name: 'Botón', icon: MousePointer, type: 'button' }
    ],
    pro: [
      { id: 'text', name: 'Texto', icon: Type, type: 'text' },
      { id: 'image', name: 'Imagen', icon: Image, type: 'image' },
      { id: 'button', name: 'Botón', icon: MousePointer, type: 'button' },
      { id: 'menu', name: 'Menú', icon: Menu, type: 'menu' },
      { id: 'form', name: 'Formulario', icon: FileText, type: 'form' },
      { id: 'gallery', name: 'Galería', icon: Camera, type: 'gallery' }
    ]
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      features: ['3 elementos básicos', '1 proyecto', 'Solo previsualización'],
      color: 'gray'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99/mes',
      features: ['Todos los elementos', 'Proyectos ilimitados', 'Exportar HTML', 'Plantillas'],
      color: 'blue',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99/mes',
      features: ['Todo del plan Pro', 'Estadísticas avanzadas', 'Soporte prioritario'],
      color: 'purple'
    }
  ];

  // Efectos
  useEffect(() => {
    const token = localStorage.getItem('webshield_token');
    if (token && !user) {
      loadUserProfile();
    }
  }, []);

  useEffect(() => {
    if (user && currentScreen === 'dashboard') {
      loadProjects();
    }
  }, [user, currentScreen]);

  // Funciones de carga
  const loadUserProfileData = async () => {
    try {
      const response = await loadUserProfile();
      setUser(response.user);
      setCurrentScreen('dashboard');
    } catch (error) {
      setCurrentScreen('login');
    }
  };
  const loadProjectsData = async () => {
    try {
      setLoading(true);
      const response = await loadProjects(); // Usar la función importada
      setProjects(response.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadStatsData = async () => {
    try {
      const response = await loadStats(); // Usar la función importada
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }
  const loadPaymentHistoryData = async () => {
    try {
      const response = await loadPaymentHistory(); // Usar la función importada
      setPaymentHistory(response.payments);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };
  // Utilidades
  const addToHistory = (elements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDraggedElements([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDraggedElements([...history[historyIndex + 1]]);
    }
  };

  const logout = () => {
    localStorage.removeItem('webshield_token');
    setUser(null);
    setCurrentProject(null);
    setDraggedElements([]);
    setCurrentScreen('login');
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case 'text':
        return 'Este es un texto editable. Haz clic para personalizarlo.';
      case 'button':
        return 'Mi Botón';
      case 'image':
        return 'Imagen placeholder';
      default:
        return '';
    }
  };

  // Funciones del editor
  const updateSelectedElement = (property, value) => {
    if (selectedElement === null) return;

    const newElements = [...draggedElements];
    if (!newElements[selectedElement].settings) {
      newElements[selectedElement].settings = {};
    }
    newElements[selectedElement].settings[property] = value;

    setDraggedElements(newElements);
    addToHistory(newElements);
  };

  const addElement = (element) => {
    const newElement = {
      ...element,
      id: `${element.id}-${Date.now()}`,
      settings: {
        content: getDefaultContent(element.type),
        color: '#3B82F6',
        size: 'medium',
        link: '',
        imageUrl: ''
      }
    };
    const newElements = [...draggedElements, newElement];
    setDraggedElements(newElements);
    addToHistory(newElements);
  };

  const removeElement = (index) => {
    const newElements = draggedElements.filter((_, i) => i !== index);
    setDraggedElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
  };

  const duplicateElement = (index) => {
    const elementToDuplicate = { ...draggedElements[index] };
    elementToDuplicate.id = `${elementToDuplicate.type}-${Date.now()}`;
    const newElements = [...draggedElements];
    newElements.splice(index + 1, 0, elementToDuplicate);
    setDraggedElements(newElements);
    addToHistory(newElements);
  };

  // Componente de Login
  const LoginScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (email.trim() && password.trim()) {
        try {
          setIsLoading(true);
          let response;
          if (isLogin) {
            response = await authAPI.login({ email: email.trim(), password });
          } else {
            response = await authAPI.register({
              email: email.trim(),
              password,
              plan: 'free'
            });
          }

          localStorage.setItem('webshield_token', response.token);
          setUser(response.user);
          setCurrentScreen('dashboard');

        } catch (error) {
          alert(`Error: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-blue-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-800">WebShield</h1>
            </div>
            <p className="text-gray-600">Constructor web seguro para tu negocio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mínimo 8 caracteres"
                required
                minLength="8"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isLogin ? (
                <LogIn className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              disabled={isLoading}
            >
              {isLogin ? '¿No tienes cuenta? Crear una nueva' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard principal
  const DashboardScreen = () => {
    const [activeTab, setActiveTab] = useState('projects');

    const ProjectsTab = () => {
      const [filteredProjects, setFilteredProjects] = useState(projects);

      useEffect(() => {
        if (searchQuery.trim()) {
          const filtered = projects.filter(project =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredProjects(filtered);
        } else {
          setFilteredProjects(projects);
        }
      }, [searchQuery, projects]);

      const createNewProject = async () => {
        try {
          setLoading(true);
          const response = await projectsAPI.create({ name: 'Nuevo Proyecto' });
          setProjects([response.project, ...projects]);
          openEditor(response.project);
        } catch (error) {
          alert(`Error: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      const deleteProject = async (projectId) => {
        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
          try {
            await projectsAPI.delete(projectId);
            setProjects(projects.filter(p => p.id !== projectId));
          } catch (error) {
            alert(`Error: ${error.message}`);
          }
        }
      };

      const openEditor = (project) => {
        setCurrentProject(project);
        if (project.elements) {
          setDraggedElements(project.elements);
          addToHistory(project.elements);
        } else {
          setDraggedElements([]);
        }
        setCurrentScreen('editor');
      };

      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mis Proyectos</h2>
            <button
              onClick={createNewProject}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FolderPlus className="w-4 h-4 mr-2" />
              )}
              Nuevo Proyecto
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-600">Cargando proyectos...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FileCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No hay proyectos</h3>
              <p className="text-gray-600 mb-6">Crea tu primer proyecto para comenzar</p>
              <button
                onClick={createNewProject}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Proyecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    <p>Creado: {new Date(project.created_at).toLocaleDateString()}</p>
                    <p>Modificado: {new Date(project.updated_at).toLocaleDateString()}</p>
                  </div>

                  <button
                    onClick={() => openEditor(project)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Abrir Editor
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const AccountTab = () => {
      const [showPaymentHistory, setShowPaymentHistory] = useState(false);

      useEffect(() => {
        if (showPaymentHistory && paymentHistory.length === 0) {
          loadPaymentHistory();
        }
      }, [showPaymentHistory]);

      return (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mi Cuenta</h2>
            <p className="text-gray-600">Configuración de perfil y facturación</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Perfil</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Actual</label>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.plan === 'free' ? 'bg-gray-100 text-gray-700' :
                      user?.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                      {user?.plan?.toUpperCase()}
                    </span>
                    {user?.plan === 'free' && (
                      <button
                        onClick={() => setCurrentScreen('plans')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Actualizar Plan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Historial de Pagos</h3>
                <button
                  onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showPaymentHistory ? 'Ocultar' : 'Ver Historial'}
                </button>
              </div>

              {showPaymentHistory && (
                <div className="space-y-4">
                  {paymentHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay pagos registrados</p>
                  ) : (
                    paymentHistory.map((payment) => (
                      <div key={payment.id} className="border-b pb-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">${payment.amount}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                            }`}>
                            {payment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">WebShield</h1>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Hola, {user?.email}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user?.plan === 'free' ? 'bg-gray-100 text-gray-700' :
                    user?.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                    {user?.plan?.toUpperCase()}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'projects' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Proyectos
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'account' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Cuenta
            </button>
          </div>

          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'account' && <AccountTab />}
        </div>
      </div>
    );
  };

  // Pantalla de Planes
  const PlansScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setCurrentScreen(user ? 'dashboard' : 'login')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver
          </button>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Elige tu plan</h2>
          <p className="text-gray-600 text-lg">Selecciona el plan que mejor se adapte a tus necesidades</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-2xl shadow-xl p-8 relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-blue-600 mb-4">{plan.price}</div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (plan.id === 'free') {
                    if (user) {
                      setCurrentScreen('dashboard');
                    } else {
                      alert('Debes iniciar sesión para continuar');
                    }
                  } else {
                    setSelectedPlan(plan);
                    setShowPayment(true);
                  }
                }}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${plan.id === 'free'
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : plan.color === 'blue'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
              >
                {plan.id === 'free' ? 'Continuar Gratis' : 'Seleccionar Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Modal de Pago
  const PaymentModal = () => {
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async (e) => {
      e.preventDefault();
      setIsProcessing(true);

      try {
        // Crear intención de pago
        const intent = await paymentsAPI.createIntent({
          plan: selectedPlan.id,
          amount: selectedPlan.id === 'pro' ? 9.99 : 19.99
        });

        // Simular procesamiento
        setTimeout(async () => {
          try {
            await paymentsAPI.confirm(intent.payment_id, {
              stripe_payment_id: `pi_demo_${Date.now()}`
            });

            setUser({ ...user, plan: selectedPlan.id });
            setShowPayment(false);
            setCurrentScreen('dashboard');
            alert(`Plan ${selectedPlan.name} activado exitosamente!`);
          } catch (error) {
            alert(`Error confirmando pago: ${error.message}`);
          } finally {
            setIsProcessing(false);
          }
        }, 2000);
      } catch (error) {
        alert(`Error creando pago: ${error.message}`);
        setIsProcessing(false);
      }
    };

    if (!showPayment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Completar Pago</h3>
            <p className="text-gray-600">Plan {selectedPlan?.name} - {selectedPlan?.price}</p>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
              <input
                type="text"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isProcessing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                <input
                  type="text"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                  placeholder="MM/YY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  placeholder="123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la Tarjeta</label>
              <input
                type="text"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                placeholder="Juan Pérez"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={isProcessing}
              />
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pagar {selectedPlan?.price}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente de elemento del canvas
  const CanvasElement = ({ element, index }) => {
    const settings = element.settings || {};
    const content = settings.content || getDefaultContent(element.type);
    const color = settings.color || '#3B82F6';
    const link = settings.link || '';

    const getSizeClasses = (size) => {
      switch (size) {
        case 'small': return 'text-sm p-2';
        case 'large': return 'text-xl p-6';
        default: return 'text-base p-4';
      }
    };

    const renderElement = () => {
      const sizeClasses = getSizeClasses(settings.size);

      switch (element.type) {
        case 'text':
          return (
            <div className={`border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors ${sizeClasses}`}>
              <div style={{ color }} className="prose max-w-none">
                {content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          );

        case 'image':
          const imageUrl = settings.imageUrl || '';
          return (
            <div className={`border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors ${sizeClasses}`}>
              {imageUrl ? (
                <img src={imageUrl} alt={content} className="w-full h-48 object-cover rounded" />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">{content}</p>
                  </div>
                </div>
              )}
            </div>
          );

        case 'button':
          return (
            <div className={`border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors ${sizeClasses}`}>
              <button
                className="px-8 py-3 rounded-lg hover:opacity-80 transition-colors font-medium"
                style={{ backgroundColor: color, color: 'white' }}
                onClick={() => link && window.open(link, '_blank')}
              >
                {content}
              </button>
            </div>
          );

        case 'menu':
          return (
            <div className={`border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors ${sizeClasses}`}>
              <nav className="flex space-x-8">
                <button className="text-gray-700 hover:text-blue-600 font-medium py-2">Inicio</button>
                <button className="text-gray-700 hover:text-blue-600 font-medium py-2">Servicios</button>
                <button className="text-gray-700 hover:text-blue-600 font-medium py-2">Contacto</button>
              </nav>
            </div>
          );

        case 'form':
          return (
            <div className={`border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors ${sizeClasses}`}>
              <div className="bg-green-50 border border-green-200 rounded p-2 mb-4">
                <p className="text-xs text-green-700">Formulario protegido por WebShield</p>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" className="px-6 py-2 rounded-md font-medium text-white hover:opacity-80" style={{ backgroundColor: color }}>
                  Enviar de forma segura
                </button>
              </form>
            </div>
          );

        case 'gallery':
          return (
            <div className={`border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors ${sizeClasses}`}>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Galería de imágenes</h3>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          );

        default:
          return <div>Elemento desconocido</div>;
      }
    };

    return (
      <div
        className={`mb-4 relative group ${selectedElement === index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        onClick={() => setSelectedElement(index)}
      >
        {renderElement()}

        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateElement(index);
            }}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 shadow-lg"
            title="Duplicar elemento"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeElement(index);
            }}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
            title="Eliminar elemento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Editor Screen
  const EditorScreen = () => {
    const availableElements = user?.plan === 'free' ? elements.free : elements.pro;
    const canExport = user?.plan === 'pro' || user?.plan === 'premium';
    const canSave = user?.plan === 'pro' || user?.plan === 'premium';

    const handleExport = async () => {
      if (!canExport) {
        alert('Debes actualizar a Pro o Premium para exportar tu proyecto.');
        return;
      }

      if (!currentProject?.id) {
        alert('Debes guardar el proyecto primero antes de exportar.');
        return;
      }

      try {
        setLoading(true);
        const response = await projectsAPI.export(currentProject.id);

        const blob = new Blob([response.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Proyecto exportado exitosamente con protecciones de seguridad WebShield!');
      } catch (error) {
        alert(`Error exportando: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleSave = async () => {
      if (!canSave) {
        alert('Debes actualizar a Pro o Premium para guardar en la nube.');
        return;
      }

      if (!currentProject?.id) {
        alert('Error: No hay proyecto activo para guardar.');
        return;
      }

      try {
        setIsSaving(true);
        await projectsAPI.save(currentProject.id, draggedElements);
        alert('Proyecto guardado exitosamente en la nube!');
      } catch (error) {
        alert(`Error guardando: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    };

    if (isPreview) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-6 shadow-lg">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center space-x-4">
                <Eye className="w-6 h-6" />
                <div>
                  <h3 className="text-xl font-semibold">Vista Previa</h3>
                  <p className="text-blue-200 text-sm">{currentProject?.name || 'Proyecto sin nombre'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPreview(false)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Volver al Editor
              </button>
            </div>
          </div>
          <div className="max-w-6xl mx-auto p-8">
            {draggedElements.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                <Type className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Tu página web aparecerá aquí</h2>
                <p className="text-gray-600 text-lg">Agrega elementos desde el editor para ver tu sitio en acción</p>
              </div>
            ) : (
              <div className="space-y-6">
                {draggedElements.map((element, index) => (
                  <div key={`preview-${index}`} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <CanvasElement element={element} index={index} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">WebShield</h1>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm font-medium text-gray-700">{currentProject?.name || 'Proyecto sin nombre'}</span>
              {isSaving && (
                <div className="flex items-center text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  <span className="text-xs">Guardando...</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${historyIndex <= 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                title="Deshacer"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${historyIndex >= history.length - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                title="Rehacer"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${canSave && !isSaving
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium shadow-sm transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Previsualizar
              </button>
              <button
                onClick={handleExport}
                disabled={!canExport || loading}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${canExport && !loading
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Exportando...' : 'Exportar'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex max-w-7xl mx-auto">
          <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Elementos</h3>

              {user?.plan === 'free' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Plan Limitado</p>
                      <p className="text-xs text-amber-700 mt-1">Solo 3 elementos básicos disponibles</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {availableElements.map((element) => (
                  <div
                    key={element.id}
                    onClick={() => addElement(element)}
                    className="flex items-center p-3 mb-2 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors group"
                  >
                    <element.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{element.name}</span>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500 ml-auto" />
                  </div>
                ))}
              </div>

              {user?.plan === 'free' && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-3 font-medium">Elementos Pro/Premium:</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-400">
                      <Lock className="w-3 h-3 mr-2" />
                      Menú de navegación avanzado
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Lock className="w-3 h-3 mr-2" />
                      Formularios seguros
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Lock className="w-3 h-3 mr-2" />
                      Galería de imágenes
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="min-h-[600px] bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 hover:border-blue-400 transition-colors shadow-sm">
              {draggedElements.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mb-6">
                    <Type className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <Shield className="w-12 h-12 text-blue-300 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-500 mb-3">Comienza a construir tu página web</h3>
                  <p className="text-gray-400 mb-6">Haz clic en los elementos del panel izquierdo para agregarlos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {draggedElements.map((element, index) => (
                    <CanvasElement key={`${element.id}-${index}`} element={element} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Propiedades</h3>

              {selectedElement !== null ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">Elemento seleccionado:</p>
                    <p className="text-xs text-blue-600 mt-1">{draggedElements[selectedElement]?.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                    <textarea
                      rows="3"
                      value={draggedElements[selectedElement]?.settings?.content || ''}
                      onChange={(e) => updateSelectedElement('content', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Escribe el contenido del elemento..."
                    />
                  </div>

                  {draggedElements[selectedElement]?.type === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                      <input
                        type="url"
                        value={draggedElements[selectedElement]?.settings?.imageUrl || ''}
                        onChange={(e) => updateSelectedElement('imageUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="color"
                      value={draggedElements[selectedElement]?.settings?.color || '#3B82F6'}
                      onChange={(e) => updateSelectedElement('color', e.target.value)}
                      className="w-full h-12 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
                    <select
                      value={draggedElements[selectedElement]?.settings?.size || 'medium'}
                      onChange={(e) => updateSelectedElement('size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">Pequeño</option>
                      <option value="medium">Mediano</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enlace</label>
                    <input
                      type="url"
                      value={draggedElements[selectedElement]?.settings?.link || ''}
                      onChange={(e) => updateSelectedElement('link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Selecciona un elemento para editarlo</p>
                </div>
              )}

              {user?.plan === 'free' && (
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div className="text-center">
                    <Crown className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-800 mb-2">¿Necesitas más poder?</h4>
                    <p className="text-sm text-gray-600 mb-4">Desbloquea todos los elementos y funciones profesionales</p>
                    <button
                      onClick={() => setCurrentScreen('plans')}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-medium transition-all shadow-sm"
                    >
                      Actualizar Plan
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-800">Seguridad WebShield</h4>
                </div>
                <ul className="text-sm text-green-700 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Formularios protegidos XSS
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    HTTPS obligatorio
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validación automática
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Código limpio y seguro
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizado principal
  return (
    <div className="font-sans">
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'plans' && <PlansScreen />}
      {currentScreen === 'dashboard' && <DashboardScreen />}
      {currentScreen === 'editor' && <EditorScreen />}
      <PaymentModal />
    </div>
  );
};

export default WebShield;
