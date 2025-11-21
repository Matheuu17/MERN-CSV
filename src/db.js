import mongoose from "mongoose";
import dotenv from 'dotenv'; // Libreria para la contraseña

dotenv.config(); // Cargamos las variables del archivo .env

export const connectDB = async () => {
    try {
        if(!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set in .env');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('>>>> Database connected');
    } catch (error) {
        console.log(error);
    }    
};  