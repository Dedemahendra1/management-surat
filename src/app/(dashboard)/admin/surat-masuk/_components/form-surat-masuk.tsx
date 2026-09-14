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
import {
  DISPOSISI_OPTIONS,
  SURAT_MASUK_STATUS_LIST,
} from '@/constant/surat-constant';
import { Loader2, FileText } from 'lucide-react';
import { FormEvent } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

type FormSuratMasukProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: 'Create' | 'Update';
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
};

export default function FormSuratMasuk<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
  preview,
  setPreview,
}: FormSuratMasukProps<T>) {
  const statusList = SURAT_MASUK_STATUS_LIST.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>
          {type === 'Create' ? 'Tambah' : 'Edit'} Surat Masuk
        </DialogTitle>
        <DialogDescription>
          {type === 'Create'
            ? 'Tambahkan surat masuk baru ke dalam sistem'
            : 'Perbarui informasi surat masuk'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4">
        <FieldGroup>
          {/* Informasi Surat */}
          <div className="col-span-full">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Informasi Surat
            </p>
          </div>

          <FormInput
            form={form}
            name={'nomor' as Path<T>}
            label="Nomor Surat"
            placeholder="Contoh: 001/ABC/2026"
          />

          <FormInput
            form={form}
            name={'tanggal' as Path<T>}
            label="Tanggal"
            type="date"
          />

          <FormInput
            form={form}
            name={'asal_surat' as Path<T>}
            label="Asal Surat"
            placeholder="Contoh: PT ABC, Dinas Pendidikan"
          />

          <FormInput
            form={form}
            name={'perihal' as Path<T>}
            label="Perihal"
            placeholder="Perihal surat"
          />

          <FormSelect
            form={form}
            name={'status' as Path<T>}
            label="Status"
            selectItem={statusList}
          />

          <FormInput
            form={form}
            name={'disposisi' as Path<T>}
            label="Disposisi dari Pimpinan"
            placeholder="Disposisi dari pimpinan (opsional)"
            type="textarea"
          />

          <div className="flex flex-wrap gap-1.5">
            {DISPOSISI_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  form.setValue('disposisi' as Path<T>, option as never)
                }
                className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                {option}
              </button>
            ))}
          </div>

          <FormInput
            form={form}
            name={'keterangan' as Path<T>}
            label="Keterangan"
            placeholder="Keterangan tambahan (opsional)"
            type="textarea"
          />

          {/* File */}
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

          {/* Arsip Fisik */}
          <div className="col-span-full">
            <p className="text-sm font-medium text-muted-foreground mb-2 mt-4">
              Lokasi Arsip Fisik
            </p>
          </div>

          <FormInput
            form={form}
            name={'lokasi_lemari' as Path<T>}
            label="Lemari"
            placeholder="Contoh: Lemari A"
          />

          <FormInput
            form={form}
            name={'lokasi_rak' as Path<T>}
            label="Rak"
            placeholder="Contoh: Rak 02"
          />

          <FormInput
            form={form}
            name={'lokasi_map' as Path<T>}
            label="Map"
            placeholder="Contoh: Surat Masuk 2026"
          />

          <FormInput
            form={form}
            name={'lokasi_box' as Path<T>}
            label="Box"
            placeholder="Contoh: BOX-03"
          />

          <FormInput
            form={form}
            name={'keterangan_fisik' as Path<T>}
            label="Keterangan Fisik"
            placeholder="Keterangan tambahan arsip fisik"
            type="textarea"
          />
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>

          <Button type="submit">
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : type === 'Create' ? (
              'Simpan'
            ) : (
              'Perbarui'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
