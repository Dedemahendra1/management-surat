// ─── Surat Masuk ─────────────────────────────────────────────────────────────

export const INITIAL_CREATE_SURAT_MASUK_FORM = {
  nomor: '',
  tanggal: '',
  asal_surat: '',
  perihal: '',
  status: 'diterima' as 'diterima',
  disposisi: '',
  keterangan: '',
  file_url: '',
  lokasi_lemari: '',
  lokasi_rak: '',
  lokasi_map: '',
  lokasi_box: '',
  keterangan_fisik: '',
};

export const INITIAL_STATE_CREATE_SURAT_MASUK = {
  status: 'idle',
  errors: {
    nomor: [],
    tanggal: [],
    asal_surat: [],
    perihal: [],
    status: [],
    disposisi: [],
    keterangan: [],
    file_url: [],
    lokasi_lemari: [],
    lokasi_rak: [],
    lokasi_map: [],
    lokasi_box: [],
    keterangan_fisik: [],
    _form: [],
  },
};

export const INITIAL_STATE_UPDATE_SURAT_MASUK = {
  status: 'idle',
  errors: {
    nomor: [],
    tanggal: [],
    asal_surat: [],
    perihal: [],
    status: [],
    disposisi: [],
    keterangan: [],
    file_url: [],
    lokasi_lemari: [],
    lokasi_rak: [],
    lokasi_map: [],
    lokasi_box: [],
    keterangan_fisik: [],
    _form: [],
  },
};

export const HEADER_TABLE_SURAT_MASUK = [
  'No',
  'Nomor',
  'Asal Surat',
  'Perihal',
  'Tanggal',
  'Status',
  'Aksi',
];

export const SURAT_MASUK_STATUS_LIST = [
  { value: 'diterima', label: 'Diterima' },
  { value: 'disposisi', label: 'Disposisi' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'diarsipkan', label: 'Diarsipkan' },
];

export const DISPOSISI_OPTIONS = [
  'Ke Bagian Umum',
  'Ke Kabid Pelayanan',
  'Ke Sekretariat',
  'Diteruskan ke Kasubag',
  'Untuk ditindaklanjuti',
  'Untuk diarsipkan',
];

// ─── Surat Keluar ────────────────────────────────────────────────────────────

export const INITIAL_CREATE_SURAT_KELUAR_FORM = {
  nomor: '',
  tanggal: '',
  tujuan: '',
  perihal: '',
  status: 'dibuat' as 'dibuat',
  surat_masuk_id: 'none',
  keterangan: '',
  file_url: '',
  lokasi_lemari: '',
  lokasi_rak: '',
  lokasi_map: '',
  lokasi_box: '',
  keterangan_fisik: '',
};

export const INITIAL_STATE_CREATE_SURAT_KELUAR = {
  status: 'idle',
  errors: {
    nomor: [],
    tanggal: [],
    tujuan: [],
    perihal: [],
    status: [],
    surat_masuk_id: [],
    keterangan: [],
    file_url: [],
    lokasi_lemari: [],
    lokasi_rak: [],
    lokasi_map: [],
    lokasi_box: [],
    keterangan_fisik: [],
    _form: [],
  },
};

export const INITIAL_STATE_UPDATE_SURAT_KELUAR = {
  status: 'idle',
  errors: {
    nomor: [],
    tanggal: [],
    tujuan: [],
    perihal: [],
    status: [],
    surat_masuk_id: [],
    keterangan: [],
    file_url: [],
    lokasi_lemari: [],
    lokasi_rak: [],
    lokasi_map: [],
    lokasi_box: [],
    keterangan_fisik: [],
    _form: [],
  },
};

export const HEADER_TABLE_SURAT_KELUAR = [
  'No',
  'Nomor',
  'Tujuan',
  'Perihal',
  'Tanggal',
  'Status',
  'Aksi',
];

export const SURAT_KELUAR_STATUS_LIST = [
  { value: 'dibuat', label: 'Dibuat' },
  { value: 'disetujui', label: 'Disetujui' },
  { value: 'dikirim', label: 'Dikirim' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'diarsipkan', label: 'Diarsipkan' },
];
