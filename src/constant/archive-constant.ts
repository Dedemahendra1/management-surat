export const INITIAL_CREATE_CATEGORY_FORM = {
  name: '',
  description: '',
  color: '#3b82f6',
};

export const INITIAL_STATE_CREATE_CATEGORY = {
  status: 'idle',
  errors: {
    name: [],
    description: [],
    color: [],
    _form: [],
  },
};

export const INITIAL_STATE_UPDATE_CATEGORY = {
  status: 'idle',
  errors: {
    name: [],
    description: [],
    color: [],
    _form: [],
  },
};

export const INITIAL_CREATE_ARCHIVE_FORM = {
  title: '',
  category_id: '',
  number: '',
  date: '',
  description: '',
  file_url: '',
};

export const INITIAL_STATE_CREATE_ARCHIVE = {
  status: 'idle',
  errors: {
    title: [],
    category_id: [],
    number: [],
    date: [],
    description: [],
    file_url: [],
    _form: [],
  },
};

export const INITIAL_STATE_UPDATE_ARCHIVE = {
  status: 'idle',
  errors: {
    title: [],
    category_id: [],
    number: [],
    date: [],
    description: [],
    file_url: [],
    _form: [],
  },
};

export const HEADER_TABLE_ARCHIVE = [
  'No',
  'Nomor',
  'Judul',
  'Kategori',
  'Tanggal',
  'Aksi',
];

export const HEADER_TABLE_CATEGORY = [
  'No',
  'Nama',
  'Deskripsi',
  'Warna',
  'Aksi',
];
