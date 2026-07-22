import FormImage from '@/components/common/form-image';
import FormInput from '@/components/common/form-input';
import FormSelect from '@/components/common/form-select';
import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { ROLE_LIST } from '@/constant/auth-constant';
import { Preview } from '@/types/general';
import { Loader2 } from 'lucide-react';
import { FormEvent } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

type FormUserProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: 'Create' | 'Update';
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
};

export default function FormUser<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
  preview,
  setPreview,
}: FormUserProps<T>) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{type} User</DialogTitle>
        <DialogDescription>
          {type === 'Create'
            ? 'Create a new user to access the dashboard'
            : 'Update user information'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4">
        <FieldGroup>
          <FormInput
            form={form}
            name={'name' as Path<T>}
            label="Name"
            placeholder="Insert your name"
          />

          {type === 'Create' && (
            <FormInput
              form={form}
              name={'email' as Path<T>}
              label="Email"
              type="email"
              placeholder="Insert your email"
            />
          )}

          <FormImage
            form={form}
            name={'avatar_url' as Path<T>}
            label="Avatar"
            preview={preview}
            setPreview={setPreview}
          />

          <FormSelect
            form={form}
            name={'role' as Path<T>}
            label="Role"
            selectItem={ROLE_LIST}
          />

          {type === 'Create' && (
            <FormInput
              form={form}
              name={'password' as Path<T>}
              label="Password"
              type="password"
              placeholder="******"
            />
          )}
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button type="submit">
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              type
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}