export type SuratMasukFormState = {
  status?: string;
  errors?: {
    nomor?: string[];
    tanggal?: string[];
    asal_surat?: string[];
    perihal?: string[];
    status?: string[];
    disposisi?: string[];
    keterangan?: string[];
    file_url?: string[];
    lokasi_lemari?: string[];
    lokasi_rak?: string[];
    lokasi_map?: string[];
    lokasi_box?: string[];
    keterangan_fisik?: string[];
    _form?: string[];
  };
};

export type SuratKeluarFormState = {
  status?: string;
  errors?: {
    nomor?: string[];
    tanggal?: string[];
    tujuan?: string[];
    perihal?: string[];
    status?: string[];
    surat_masuk_id?: string[];
    keterangan?: string[];
    file_url?: string[];
    lokasi_lemari?: string[];
    lokasi_rak?: string[];
    lokasi_map?: string[];
    lokasi_box?: string[];
    keterangan_fisik?: string[];
    _form?: string[];
  };
};

export type SuratMasuk = {
  id: string;
  nomor: string;
  tanggal?: string;
  asal_surat?: string;
  perihal: string;
  status: string;
  disposisi?: string;
  keterangan?: string;
  file_url?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  lokasi_lemari?: string;
  lokasi_rak?: string;
  lokasi_map?: string;
  lokasi_box?: string;
  keterangan_fisik?: string;
  created_by?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name?: string;
    avatar_url?: string;
  };
};

export type SuratKeluar = {
  id: string;
  nomor: string;
  tanggal?: string;
  tujuan?: string;
  perihal: string;
  status: string;
  surat_masuk_id?: string;
  keterangan?: string;
  file_url?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  lokasi_lemari?: string;
  lokasi_rak?: string;
  lokasi_map?: string;
  lokasi_box?: string;
  keterangan_fisik?: string;
  created_by?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name?: string;
    avatar_url?: string;
  };
  surat_masuk?: SuratMasuk;
};

export type SuratLog = {
  id: string;
  user_id?: string;
  surat_id: string;
  surat_type: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
  profiles?: {
    name?: string;
    avatar_url?: string;
  };
};

export type { SuratMasuk as SuratMasukRelation };
