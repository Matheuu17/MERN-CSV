import User from '../models/user.model.js';
import bcrypt from 'bcryptjs'; 
import { createAccsessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config.js';

// Controller de autenticacion: register, login, logout, profile, verifyToken

// Register: crea usuario, guarda hash de password y devuelve user mas el cookie con token
export const register = async (req, res) => {   
    const {email, password, username} = (req.body);
    
    try {
        const userFound = await User.findOne({email});
        if(userFound) return res.status(400).json(["The email already exits"]);

        // Hashear password y guardar usuario
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: passwordHash });

        const userSaved = await newUser.save();
        const token = await createAccsessToken({id: userSaved._id});

        // Enviar token en cookie y devolver datos basicos
        res.cookie('token', token);
        res.json({
            id: userSaved._id, 
            username: userSaved.username,
            email: userSaved.email,
            createAt: userSaved.createdAt,
            updatedAt: userSaved.updatedAt,
        }); 
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Login: valida credenciales, crea token y devuelve user
export const login = async (req, res) => {
    const {email, password} = (req.body);
    
    try {
        const userFound = await User.findOne({email});
        if (!userFound) return res.status(400).json({message: "Usuario no encontrado"});

        // Comparar hash de password
        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json({message: "Contraseña Incorrecta"});

        const token = await createAccsessToken({id: userFound._id});

        res.cookie('token', token);
        res.json({
            id: userFound._id, 
            username: userFound.username,
            email: userFound.email,
            createAt: userFound.createdAt,
            updatedAt: userFound.updatedAt,
        }); 
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Logout: expira la cookie token
export const logout = async (req, res) => {
    res.cookie('token', "", { expires: new Date(0) });
    return res.sendStatus(200); 
};

// Profile: devuelve datos del usuario logueado (req.user viene de middleware)
export const profile = async (req, res) => {
    const userFound = await User.findById(req.user.id);
    if (!userFound) return res.status(400).json({message: "User not found"});

    return res.json({
        id: userFound._id, 
        username: userFound.username,
        email: userFound.email,
        createAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
    });
};

// verifyToken: valida cookie JWT y devuelve datos del usuario
export const verifyToken = async (req, res) => {
    const {token} = req.cookies;
    if (!token) return res.status(401).json({message: 'No autorizado'});

    jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if (err) return res.status(401).json({message: 'No autorizado'});

        const userFound = await User.findById(user.id);
        if (!userFound) return res.status(401).json({message: 'No autorizado'});

        return res.json({ id: userFound._id, username: userFound.username, email: userFound.email });
    });
};