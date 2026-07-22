'use client';

import FormInput from '@/components/common/form-input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { INITIAL_LOGIN_FORM, INITIAL_STATE_LOGIN_FORM } from '@/constant/auth-constant';
import { LoginForm, loginSchemaForm,  } from '@/validations/auth-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { login } from '../actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchemaForm),
    defaultValues: INITIAL_LOGIN_FORM,
  });

  const [loginState, loginAction, isPendingLogin] = useActionState(
    login,
    INITIAL_STATE_LOGIN_FORM,
  );

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    startTransition(() => {
      loginAction(formData);
    });
  });

  useEffect(() => {
    if (loginState?.status === 'error') {
      toast.error('Login Failed', {
        description: loginState.errors?._form?.[0],
      });
      startTransition(() => {
        loginAction(null);
      });
    }
  }, [loginState]);

 console.log( loginState);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome</CardTitle>
        <CardDescription>
          Login to access all features
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <FieldGroup>
            <FormInput
              form={form}
              name="email"
              label="Email"
              type="email"
              placeholder="Insert your email"
            />

            <FormInput
              form={form}
              name="password"
              label="Password"
              type="password"
              placeholder="******"
            />

            <Button type="submit">
              {isPendingLogin ? <Loader2 className="animate-spin" /> : 'Login'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}