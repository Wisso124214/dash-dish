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
import { validationValues } from "@/utils/validator/validator.tsx";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .email("El email no es válido")
    .min(1, "El email es obligatorio")
    .max(
      validationValues.user.email.max,
      `El email no puede tener más de ${validationValues.user.email.max} caracteres`
    ),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    fetch(SERVER_URL + "/forgotPassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
      }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.errorCode) {
          toast.success(
            response.message ||
              "Se ha enviado un correo de verificación a la dirección ingresada. Por favor, revise su correo y siga los pasos indicados."
          );
          // Don't set isLoggedIn for forgot password
          form.reset();
        } else {
          toast.error(
            response.message || "Hubo un error inesperado. Intente nuevamente"
          );
        }
      })
      .catch(() => {
        toast.error("Hubo un error inesperado. Por favor, intente más tarde.");
      });
  };

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Olvidó su contraseña?</CardTitle>
          <CardDescription>
            Ingrese sus email para enviarle un correo de autenticación
          </CardDescription>
          <CardAction>
            <Button onClick={() => navigate("/login")} variant="link">
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
              <Button type="submit" className="w-full">
                Reestablecer contraseña
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-2"></CardFooter>
      </Card>
    </div>
  );
}
