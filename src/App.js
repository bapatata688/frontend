import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Shield,
  Server,
  Globe,
  Database,
  User,
  Lock,
  FileText,
  UserPlus
} from 'lucide-react';

const ConnectionTester = () => {
  const [tests, setTests] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [backendUrl, setBackendUrl] = useState('https://webshield100-backend.onrender.com');

  const testConfig = [
    {
      id: 'backend-health',
      name: 'Backend Health Check',
      description: 'Verifica si el backend está respondiendo',
      icon: Server,
      endpoint: '/health',
      method: 'GET'
    },
    {
      id: 'cors-check',
      name: 'CORS Configuration',
      description: 'Verifica configuración CORS',
      icon: Globe,
      endpoint: '/api/health',
      method: 'GET'
    },
    {
      id: 'auth-register',
      name: 'Auth - Register Endpoint',
      description: 'Prueba el endpoint de registro',
      icon: UserPlus,
      endpoint: '/api/auth/register',
      method: 'POST',
      requiresBody: true
    },
    {
      id: 'auth-login',
      name: 'Auth - Login Endpoint',
      description: 'Prueba el endpoint de login',
      icon: Lock,
      endpoint: '/api/auth/login',
      method: 'POST',
      requiresBody: true
    },
    {
      id: 'projects-list',
      name: 'Projects - List Endpoint',
      description: 'Obtener lista de proyectos (requiere auth)',
      icon: FileText,
      endpoint: '/api/projects',
      method: 'GET',
      requiresAuth: true
    },
    {
      id: 'database-connection',
      name: 'Database Connection',
      description: 'Verifica conexión con base de datos',
      icon: Database,
      endpoint: '/api/db-status',
      method: 'GET'
    }
  ];

  useEffect(() => {
    initializeTests();
  }, []);

  const initializeTests = () => {
    const initialTests = testConfig.map(test => ({
      ...test,
      status: 'pending', // pending, running, success, error
      message: '',
      responseTime: null,
      details: null
    }));
    setTests(initialTests);
  };

  const updateTestStatus = (testId, updates) => {
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, ...updates } : test
    ));
  };

  const runSingleTest = async (test) => {
    const startTime = Date.now();
    updateTestStatus(test.id, { status: 'running', message: 'Ejecutando...', details: null });

    try {
      const url = `${backendUrl}${test.endpoint}`;
      
      const config = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Agregar body si es necesario
      if (test.requiresBody) {
        if (test.id === 'auth-register') {
          config.body = JSON.stringify({
            email: `test-${Date.now()}@test.com`,
            password: 'test123456',
            plan: 'free'
          });
        } else if (test.id === 'auth-login') {
          config.body = JSON.stringify({
            email: 'test@test.com',
            password: 'test123456'
          });
        }
      }

      // Agregar token si es necesario
      if (test.requiresAuth) {
        const token = localStorage.getItem('webshield_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        } else {
          updateTestStatus(test.id, {
            status: 'error',
            message: 'No hay token de autenticación',
            responseTime: Date.now() - startTime,
            details: 'Inicia sesión primero para probar este endpoint'
          });
          return;
        }
      }

      console.log(`Testing ${test.name}:`, { url, config });

      const response = await fetch(url, config);
      const responseTime = Date.now() - startTime;
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { message: 'Respuesta no JSON', text: await response.text() };
      }

      console.log(`Response for ${test.name}:`, { status: response.status, data });

      if (response.ok) {
        updateTestStatus(test.id, {
          status: 'success',
          message: `✅ Conexión exitosa (${response.status})`,
          responseTime,
          details: {
            status: response.status,
            headers: Object.fromEntries([...response.headers.entries()]),
            data: data
          }
        });
      } else {
        updateTestStatus(test.id, {
          status: 'error',
          message: `❌ Error ${response.status}: ${data.error || data.message || 'Error desconocido'}`,
          responseTime,
          details: {
            status: response.status,
            headers: Object.fromEntries([...response.headers.entries()]),
            data: data
          }
        });
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`Error testing ${test.name}:`, error);
      
      updateTestStatus(test.id, {
        status: 'error',
        message: `❌ Error de conexión: ${error.message}`,
        responseTime,
        details: {
          error: error.message,
          stack: error.stack,
          name: error.name
        }
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    initializeTests();

    // Ejecutar tests secuencialmente
    for (const test of testConfig) {
      await runSingleTest(test);
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const TestResult = ({ test, onRerun }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
      <div className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(test.status)}
            <test.icon className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">{test.name}</h3>
              <p className="text-sm text-gray-600">{test.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {test.responseTime && (
              <span className="text-xs text-gray-500">{test.responseTime}ms</span>
            )}
            <button
              onClick={() => onRerun(test)}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              disabled={test.status === 'running'}
            >
              Reintentar
            </button>
          </div>
        </div>

        {test.message && (
          <div className="mt-3 text-sm">
            <p className="font-mono text-gray-700">{test.message}</p>
          </div>
        )}

        {test.details && (
          <div className="mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showDetails ? 'Ocultar' : 'Ver'} detalles técnicos
            </button>
            
            {showDetails && (
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                <pre>{JSON.stringify(test.details, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const runningCount = tests.filter(t => t.status === 'running').length;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-6">
          <Shield className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WebShield - Verificador de Conexiones</h1>
            <p className="text-gray-600">Diagnóstico de conectividad entre Frontend, Backend y API</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del Backend
            </label>
            <input
              type="url"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="https://webshield100-backend.onrender.com"
            />
          </div>
          <div className="pt-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              {isRunning ? 'Probando...' : 'Ejecutar Tests'}
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{tests.length}</div>
            <div className="text-sm text-gray-500">Tests Totales</div>
          </div>
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-green-600">Exitosos</div>
          </div>
          <div className="bg-red-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-red-600">Con Error</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{runningCount}</div>
            <div className="text-sm text-blue-600">Ejecutando</div>
          </div>
        </div>
      </div>

      {/* Resultados de Tests */}
      <div className="space-y-4">
        {tests.map((test) => (
          <TestResult 
            key={test.id} 
            test={test} 
            onRerun={(test) => runSingleTest(test)}
          />
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Consejos para solucionar problemas:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Si hay errores CORS, verifica que tu backend permita el origen de tu frontend</li>
              <li>• Si los endpoints no responden, verifica que el backend esté ejecutándose</li>
              <li>• Para endpoints que requieren auth, primero inicia sesión en tu aplicación</li>
              <li>• Revisa la consola del navegador para más detalles de errores</li>
              <li>• Verifica que las URLs de los endpoints coincidan con tu backend</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTester;
