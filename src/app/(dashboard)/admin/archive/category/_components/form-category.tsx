import FormInput from '@/components/common/form-input';
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
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { FormEvent } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

type FormCategoryProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: 'Create' | 'Update';
};

export default function FormCategory<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
}: FormCategoryProps<T>) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{type} Kategori</DialogTitle>
        <DialogDescription>
          {type === 'Create'
            ? 'Tambahkan kategori arsip baru'
            : 'Perbarui informasi kategori'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4">
        <FieldGroup>
          <FormInput
            form={form}
            name={'name' as Path<T>}
            label="Nama Kategori"
            placeholder="Masukkan nama kategori"
          />

          <FormInput
            form={form}
            name={'description' as Path<T>}
            label="Deskripsi"
            placeholder="Deskripsi singkat (opsional)"
            type="textarea"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Warna</label>
            <Input
              type="color"
              className="h-9 w-16 cursor-pointer p-1"
              {...form.register('color' as Path<T>)}
            />
          </div>
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>

          <Button type="submit">
            {isLoading ? <Loader2 className="animate-spin" /> : type}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
