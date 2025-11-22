import mongoose from "mongoose";

// Modelo Task: guarda cada coincidencia encontrada por el motor de busqueda
const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sequence: { type: String, required: true },
  searchData: { type: String, required: true },
  algorithm: { type: String, required: true, enum: ['KMP', 'Rabin-Karp'] },
  allowOverlap: { type: Boolean, default: true },
  positions: { type: [Number], default: [] },
  executionTime: { type: Number, default: 0 }, // milliseconds
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
}, {
  timestamps: true
});

export default mongoose.model('Task', TaskSchema);
