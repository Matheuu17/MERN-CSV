import jwt from 'jsonwebtoken'; 
import {TOKEN_SECRET} from '../config.js';

// Crea un access token JWT con expiration de 1 dia
// payload: objeto con la informacion a firmar como el userId
export function createAccsessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
        payload,
        TOKEN_SECRET,
         {
            expiresIn: "1d",
         },
         (err, token) => {
            if (err) reject(err); 
            resolve(token);          
         }
     );
 });
}