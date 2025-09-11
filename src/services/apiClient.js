import axios from 'axios';
// Ajuste o caminho para o seu arquivo de configuração do Firebase no frontend
import { auth } from './firebase'; 

// Cria uma instância do Axios com a URL base da sua API
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // A porta do seu backend
});

/**
 * Interceptor de Requisição (Request Interceptor)
 * * Esta função é executada AUTOMATICAMENTE pelo Axios antes de CADA requisição.
 * Sua missão é verificar se há um usuário logado e, em caso positivo,
 * obter o token JWT e anexá-lo ao header 'Authorization'.
 */
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const token = await user.getIdToken();
        console.log('3. Interceptor ativado. Anexando token ao header.');
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Não foi possível obter o token de autenticação", error);
      }
    }

    return config; // Continua com a requisição (com ou sem o token)
  }, 
  (error) => {
    // Faz algo com o erro da requisição
    return Promise.reject(error);
  }
);

export default apiClient;