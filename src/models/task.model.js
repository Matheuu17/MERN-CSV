import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  searchData: {
    type: String,
    required: true,       // Dato solicitado por el usuario
  },
  algorithm: {
    type: String,
    required: true,       // Algoritmo seleccionado
  },
  executionTime: {
    type: Number,         // Tiempo en milisegundos
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, {
  timestamps: true
});

export default mongoose.model("Task", taskSchema);
