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
import { Input } from '@/components/ui/input';
import { Preview } from '@/types/general';
import { ArchiveCategory } from '@/types/archive';
import { Loader2, FileText } from 'lucide-react';
import { FormEvent } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

type FormArchiveProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: 'Create' | 'Update';
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
  categories: ArchiveCategory[];
};

export default function FormArchive<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
  preview,
  setPreview,
  categories,
}: FormArchiveProps<T>) {
  const categoryList = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{type === 'Create' ? 'Tambah' : 'Edit'} Arsip</DialogTitle>
        <DialogDescription>
          {type === 'Create'
            ? 'Tambahkan arsip baru ke dalam sistem'
            : 'Perbarui informasi arsip'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4">
        <FieldGroup>
          <FormInput
            form={form}
            name={'title' as Path<T>}
            label="Judul"
            placeholder="Masukkan judul arsip"
          />

          <FormInput
            form={form}
            name={'number' as Path<T>}
            label="Nomor Dokumen"
            placeholder="Contoh: 001/ABC/2026"
          />

          <FormSelect
            form={form}
            name={'category_id' as Path<T>}
            label="Kategori"
            selectItem={categoryList}
          />

          <FormInput
            form={form}
            name={'date' as Path<T>}
            label="Tanggal"
            type="date"
          />

          <FormInput
            form={form}
            name={'description' as Path<T>}
            label="Deskripsi"
            placeholder="Keterangan tambahan (opsional)"
            type="textarea"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">File Dokumen</label>
            <div className="flex items-center gap-3">
              {preview && (
                <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
                  <FileText className="h-4 w-4" />
                  <span className="max-w-[200px] truncate text-xs">
                    {preview.file?.name || 'File saat ini'}
                  </span>
                </div>
              )}
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const displayUrl = URL.createObjectURL(file);
                    setPreview?.({ file, displayUrl });
                    form.setValue('file_url' as Path<T>, file as never);
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Format: PDF, JPG, PNG. Maksimal 10MB
            </p>
          </div>
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>

          <Button type="submit">
            {isLoading ? <Loader2 className="animate-spin" /> : type === 'Create' ? 'Simpan' : 'Perbarui'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
