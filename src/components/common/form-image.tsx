import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { FileImage } from "lucide-react";

import { getImageData } from "@/lib/utils";
import { Preview } from "@/types/general";

interface FormImageProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
}

export default function FormImage<T extends FieldValues>({
  form,
  name,
  label,
  preview,
  setPreview,
}: FormImageProps<T>) {
  const error = form.formState.errors[name];

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>

      <FieldContent>
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarImage
              src={preview?.displayUrl}
              alt="preview"
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg">
              <FileImage className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <Controller
            control={form.control}
            name={name}
            render={({ field }) => (
              <Input
                type="file"
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                disabled={field.disabled}
                onChange={(event) => {
                  field.onChange(event);

                  const { file, displayUrl } = getImageData(event);

                  if (file) {
                    setPreview?.({
                      file,
                      displayUrl,
                    });
                  }
                }}
              />
            )}
          />
        </div>

        <FieldError>
          {error?.message?.toString()}
        </FieldError>
      </FieldContent>
    </Field>
  );
}