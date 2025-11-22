import axios from './axios';

// Peticiones de autenticacion: registro, login y verificacion de token.
export const registerRequest = user => axios.post(`/register`, user);
export const loginRequest = user => axios.post(`/login`, user);
export const verifyTokenRequest = () => axios.get('/verify')
