import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SERVER_URL } from '../../config';
import { useState } from 'react';
import { validateEmail } from '@/utils/validator/validator.tsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errorEmail, setErrorEmail] = useState('');

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (errorEmail) {
      toast.error('Por favor, corrija los errores antes de continuar.');
      return;
    }
    fetch(SERVER_URL + '/forgotPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.errorCode) {
          toast.success(
            response.message ||
              'Se ha enviado un correo de verificación a la dirección ingresada. Por favor, revise su correo y siga los pasos indicados.',
            15000
          );
          localStorage.setItem(
            'userData',
            JSON.stringify({ isLoggedIn: true })
          );
        } else {
          toast.error(
            response.message || 'Hubo un error inesperado. Intente nuevamente'
          );
        }
      })
      .catch(() => {
        toast.error('Hubo un error inesperado. Por favor, intente más tarde.');
      });
  };

  return (
    <div className='flex items-center justify-center h-screen w-full'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Olvidó su contraseña?</CardTitle>
          <CardDescription>
            Ingrese sus email para enviarle un correo de autenticación
          </CardDescription>
          <CardAction>
            <Button
              onClick={() => (window.location.href = '/login')}
              variant='link'
            >
              Login
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            className='w-full max-h-[50vh] overflow-y-auto pr-4'
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--primary-color) transparent',
            }}
          >
            <div className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Correo electrónico</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setEmail(value);
                    const error = await validateEmail(value);
                    if (error !== 'El email ya está en uso.')
                      setErrorEmail(error);
                  }}
                  placeholder='usuario@ejemplo.com'
                  required
                />
                {errorEmail !== '' && (
                  <span className='text-destructive text-sm font-semibold'>
                    {errorEmail}
                  </span>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className='flex-col gap-2'>
          <Button type='submit' onClick={handleLogin} className='w-full'>
            Reestablecer contraseña
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
