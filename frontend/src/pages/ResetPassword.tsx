import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SERVER_URL } from '../../config';
import { useEffect, useState } from 'react';
import {
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validator/validator.tsx';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setToken(token);
    }
  }, []);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (errorPassword || errorConfirmPassword) {
      toast.error('Por favor, corrija los errores antes de continuar.');
      return;
    }
    fetch(SERVER_URL + '/resetPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
        confirmPassword,
        token,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.errorCode) {
          toast.success(
            response.message ||
              'Su contraseña ha sido reestablecida exitosamente. Por favor inicie sesión de nuevo para continuar.'
          );
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          toast.error(
            response.message || 'Hubo un error inesperado, intente de nuevo.'
          );
        }
      })
      .catch(() => {
        toast.error(
          'Lo sentimos. Hubo un error inesperado. Por favor, intente más tarde.'
        );
      });
  };

  return (
    <div className='flex items-center justify-center h-screen w-full'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Reestablezca su contraseña</CardTitle>
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
            Reestablecer contraseña
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
