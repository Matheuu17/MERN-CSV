import axios from 'axios';

// Instancia axios con baseURL para la API y envío de cookies (withCredentials).
const instance = axios.create({
    baseURL: 'http://localhost:4000/api',
    withCredentials: true
})

export default instance;
