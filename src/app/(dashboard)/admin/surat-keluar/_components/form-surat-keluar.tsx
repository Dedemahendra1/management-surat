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
import { SuratMasuk } from '@/types/surat';
import {
  SURAT_KELUAR_STATUS_LIST,
} from '@/constant/surat-constant';
import { Loader2, FileText } from 'lucide-react';
import { FormEvent } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

type FormSuratKeluarProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: 'Create' | 'Update';
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
  suratMasukList: SuratMasuk[];
};

export default function FormSuratKeluar<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
  preview,
  setPreview,
  suratMasukList,
}: FormSuratKeluarProps<T>) {
  const statusList = SURAT_KELUAR_STATUS_LIST.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  const suratMasukOptions = [
    { value: 'none', label: 'Tidak ada surat masuk terkait' },
    ...suratMasukList.map((sm) => ({
      value: sm.id,
      label: `${sm.nomor} - ${sm.perihal} (${sm.asal_surat || '-'})`,
    })),
  ];

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>
          {type === 'Create' ? 'Tambah' : 'Edit'} Surat Keluar
        </DialogTitle>
        <DialogDescription>
          {type === 'Create'
            ? 'Tambahkan surat keluar baru ke dalam sistem'
            : 'Perbarui informasi surat keluar'}
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
            placeholder="Contoh: 015/XYZ/2026"
          />

          <FormInput
            form={form}
            name={'tanggal' as Path<T>}
            label="Tanggal"
            type="date"
          />

          <FormInput
            form={form}
            name={'tujuan' as Path<T>}
            label="Tujuan"
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

          {/* Surat Masuk Terkait */}
          <div className="col-span-full">
            <p className="text-sm font-medium text-muted-foreground mb-2 mt-4">
              Surat Masuk Terkait
            </p>
          </div>

          <FormSelect
            form={form}
            name={'surat_masuk_id' as Path<T>}
            label="Surat Masuk Terkait"
            selectItem={suratMasukOptions}
          />

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
            placeholder="Contoh: Surat Keluar 2026"
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
