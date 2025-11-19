import axios from 'axios';
import environment from '../../utils/environment';
// Token ile istek yapmak istediginde AxiosWithAuth kullanilabilir
// Tokensiz bir istek yapmak istiyorsan axiosInstance kullanabilirsin


const axiosInstance = axios.create({
    baseURL: environment.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


export default axiosInstance;
