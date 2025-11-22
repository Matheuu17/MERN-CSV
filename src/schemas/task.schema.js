import { z } from "zod";

// Schema para validar la creacion de una tarea desde el backend
export const createTaskSchema = z.object({
  searchData: z.string({
    required_error: "El dato solicitado es requerido"
  }),
  algorithm: z.string({
    required_error: "El algoritmo es requerido"
  }),
  executionTime: z.number({
    required_error: "El tiempo de ejecución es requerido"
  }),
  date: z.string().datetime().optional()
});
