import { cn } from "@/lib/utils";
import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormSelectProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  selectItem: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
}

export default function FormSelect<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  selectItem,
}: FormSelectProps<T>) {
  const error = form.formState.errors[name];

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>

      <FieldContent>
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                className={cn("w-full", {
                  "border-red-500": !!error,
                })}
              >
                <SelectValue
                  placeholder={placeholder ?? `Select ${label}`}
                />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{label}</SelectLabel>

                  {selectItem.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                      className="capitalize"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />

        <FieldError>
          {error?.message?.toString()}
        </FieldError>
      </FieldContent>
    </Field>
  );
}