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
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validator/validator.tsx';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorUsername, setErrorUsername] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (errorUsername || errorEmail || errorPassword || errorConfirmPassword) {
      toast.error('Por favor, corrija los errores antes de continuar.');
      return;
    }
    fetch(SERVER_URL + '/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        email,
        confirmPassword,
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
          <CardTitle>Registrarse</CardTitle>
          <CardDescription>
            Ingrese sus datos para crear una cuenta
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
                <Label htmlFor='username'>Nombre de usuario</Label>
                <Input
                  id='username'
                  type='text'
                  value={username}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setUsername(value);
                    const error = await validateUsername(value);
                    setErrorUsername(error);
                  }}
                  placeholder='usuario123'
                  required
                />
                {errorUsername !== '' && (
                  <span className='text-destructive text-sm font-semibold'>
                    {errorUsername}
                  </span>
                )}
              </div>
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
              <div className='grid gap-2'>
                <Label htmlFor='password'>Contraseña</Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    const error = validatePassword(value);
                    setErrorPassword(error);
                  }}
                  placeholder='•••••••••••'
                  required
                />
                {errorPassword !== '' && (
                  <span className='text-destructive text-sm font-semibold'>
                    {errorPassword}
                  </span>
                )}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='confirm-password'>Confirmar contraseña</Label>
                <Input
                  id='confirm-password'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);
                    const error = validateConfirmPassword(password, value);
                    setErrorConfirmPassword(error);
                  }}
                  placeholder='•••••••••••'
                  required
                />
                {errorConfirmPassword !== '' && (
                  <span className='text-destructive text-sm font-semibold'>
                    {errorConfirmPassword}
                  </span>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className='flex-col gap-2'>
          <Button type='submit' onClick={handleLogin} className='w-full'>
            Registrarse
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
