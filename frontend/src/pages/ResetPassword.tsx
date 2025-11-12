import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { useEffect, useState } from "react";
import { validationValues } from "@/utils/validator/validator.tsx";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const resetPasswordSchema = z
  .object({
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

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setToken(token);
    }
  }, []);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    fetch(SERVER_URL + "/resetPassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: data.password,
        confirmPassword: data.confirmPassword,
        token,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.errorCode) {
          toast.success(
            response.message ||
              "Su contraseña ha sido reestablecida exitosamente. Por favor inicie sesión de nuevo para continuar."
          );
          navigate("/login");
        } else {
          toast.error(
            response.message || "Hubo un error inesperado, intente de nuevo."
          );
        }
      })
      .catch(() => {
        toast.error(
          "Lo sentimos. Hubo un error inesperado. Por favor, intente más tarde."
        );
      });
  };

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reestablezca su contraseña</CardTitle>
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
