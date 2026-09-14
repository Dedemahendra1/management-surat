import z from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const createArchiveSchema = z.object({
  title: z.string().min(1, 'Judul arsip wajib diisi'),
  category_id: z.string().min(1, 'Kategori wajib dipilih'),
  number: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  file_url: z.union([z.string(), z.instanceof(File)]).optional(),
});

export const updateArchiveSchema = z.object({
  title: z.string().min(1, 'Judul arsip wajib diisi'),
  category_id: z.string().min(1, 'Kategori wajib dipilih'),
  number: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  file_url: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type CreateCategoryForm = z.infer<typeof createCategorySchema>;
export type UpdateCategoryForm = z.infer<typeof updateCategorySchema>;
export type CreateArchiveForm = z.infer<typeof createArchiveSchema>;
export type UpdateArchiveForm = z.infer<typeof updateArchiveSchema>;
