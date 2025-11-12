import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { SERVER_URL } from "../../config";
import {
  validationValues,
} from "@/utils/validator/validator.tsx";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(
        validationValues.user.username.min,
        `El nombre de usuario debe tener al menos ${validationValues.user.username.min} caracteres`
      )
      .max(
        validationValues.user.username.max,
        `El nombre de usuario no puede tener más de ${validationValues.user.username.max} caracteres`
      ),
    email: z
      .email("El email no es válido")
      .max(
        validationValues.user.email.max,
        `El email no puede tener más de ${validationValues.user.email.max} caracteres`
      ),
    password: z
      .string()
      .min(
        validationValues.user.password.min,
        `La contraseña debe tener al menos ${validationValues.user.password.min} caracteres`
      )
      .max(
        validationValues.user.password.max,
        `La contraseña no puede tener más de ${validationValues.user.password.max} caracteres`
      )
      .regex(
        /[A-Z]/,
        "La contraseña debe contener al menos una letra mayúscula"
      )
      .regex(
        /[a-z]/,
        "La contraseña debe contener al menos una letra minúscula"
      )
      .regex(/[0-9]/, "La contraseña debe contener al menos un número")
      .regex(
        /[-:+_º·$/[\]}{|~€|@#~€¬`«»%()?¿¡;.'"!@#\\$/%^,&*]/,
        "La contraseña debe contener al menos un símbolo"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    fetch(SERVER_URL + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        email: data.email,
        confirmPassword: data.confirmPassword,
      }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.errorCode) {
          toast.success(response.message || "Registro exitoso.");
          localStorage.setItem(
            "userData",
            JSON.stringify({ isLoggedIn: true })
          );
          navigate("/dishes");
        } else {
          toast.error(response.message || "Error en el registro.");
        }
      })
      .catch(() => {
        toast.error("Error en el registro. Por favor, intente más tarde.");
      });
  };

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Registrarse</CardTitle>
          <CardDescription>
            Ingrese sus datos para crear una cuenta
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={() => navigate("/login")}>
              Login
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full max-h-[50vh] overflow-y-auto pr-4 space-y-6"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "var(--primary-color) transparent",
              }}
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="•••••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="•••••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Registrarse
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-2"></CardFooter>
      </Card>
    </div>
  );
}
