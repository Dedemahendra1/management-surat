export type ArchiveFormState = {
  status?: string;
  errors?: {
    title?: string[];
    category_id?: string[];
    number?: string[];
    date?: string[];
    description?: string[];
    file_url?: string[];
    _form?: string[];
  };
};

export type ArchiveCategoryFormState = {
  status?: string;
  errors?: {
    name?: string[];
    description?: string[];
    color?: string[];
    _form?: string[];
  };
};

export type ArchiveCategory = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
};

export type Archive = {
  id: string;
  category_id?: string;
  created_by?: string;
  title: string;
  number?: string;
  date?: string;
  description?: string;
  file_url?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  category?: ArchiveCategory;
  profiles?: {
    name?: string;
    avatar_url?: string;
  };
};

export type ArchiveLog = {
  id: string;
  user_id?: string;
  archive_id: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
  profiles?: {
    name?: string;
    avatar_url?: string;
  };
};
