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

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    fetch(SERVER_URL + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.errorCode) {
          toast.success(response.message || 'Inicio de sesión exitoso.');
          localStorage.setItem(
            'userData',
            JSON.stringify({ isLoggedIn: true })
          );
          setTimeout(() => {
            window.location.href = '/dishes';
          }, 2000);
        } else {
          toast.error(response.message || 'Usuario o contraseña incorrectos.');
        }
      })
      .catch(() => {
        toast.error(
          'Error en el inicio de sesión. Por favor, intente más tarde.'
        );
      });
  };

  return (
    <div className='flex items-center justify-center h-screen w-full'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Ingrese su nombre de usuario para iniciar sesión en su cuenta
          </CardDescription>
          <CardAction>
            <Button
              onClick={() => (window.location.href = '/signup')}
              variant='link'
            >
              Registrarse
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='username'>Nombre de usuario</Label>
                <Input
                  id='username'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder='usuario123'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>Contraseña</Label>
                  <a
                    href='/forgot-password'
                    className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                  >
                    Olvidó su contraseña?
                  </a>
                </div>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='•••••••••••'
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className='flex-col gap-2'>
          <Button type='submit' onClick={handleLogin} className='w-full'>
            Iniciar sesión
          </Button>
          <Button variant='outline' className='w-full'>
            Iniciar sesión con Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
