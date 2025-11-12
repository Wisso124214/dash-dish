import { z } from "zod";

// Auth schemas
export const usernameSchema = z
  .string()
  .min(1, "El nombre de usuario es obligatorio.")
  .min(6, "El nombre de usuario debe tener al menos 6 caracteres.")
  .max(30, "El nombre de usuario no puede tener más de 30 caracteres.");

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(80, "La contraseña no puede tener más de 80 caracteres")
  .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "La contraseña debe contener al menos un número")
  .regex(
    /[-:+_º·$/[\]}{|~€|@#~€¬`«»%()?¿¡;.'"!@#\\$//%\\^,&\\*]/,
    "La contraseña debe contener al menos un símbolo"
  );

export const emailSchema = z
  .email("Formato de correo electrónico inválido")
  .min(1, "El correo electrónico es obligatorio.")
  .max(100, "El correo electrónico no puede tener más de 100 caracteres");

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

// Dish schemas
export const dishExtraSchema = z.object({
  name: z.string(),
  cost: z.number().positive(),
});

export const orderItemSchema = z.object({
  id_dish: z.string(),
  quantity: z.number().int().positive(),
  selected_extras: z.array(dishExtraSchema).optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  type: z.enum(["dinein", "delivery"]).default("delivery"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
