import {
  Field,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  FieldValues,
  Path,
  UseFormReturn,
} from 'react-hook-form';

type FormInputProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
};

export default function FormInput<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type = 'text',
}: FormInputProps<T>) {
  const error = form.formState.errors[name];

  return (
    <Field>
      <FieldLabel htmlFor={name}>
        {label}
      </FieldLabel>

      {type === 'textarea' ? (
        <Textarea
          id={name}
          placeholder={placeholder}
          autoComplete="off"
          className="resize-none"
          {...form.register(name)}
        />
      ) : (
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          autoComplete="off"
          {...form.register(name)}
        />
      )}

      {error && (
        <FieldError>
          {String(error.message)}
        </FieldError>
      )}
    </Field>
  );
}