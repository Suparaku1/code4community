export type ReportStatus = 'i_ri' | 'ne_proces' | 'perfunduar';

export interface Report {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  photo_url: string | null;
  has_location: boolean;
  latitude: number | null;
  longitude: number | null;
  neighborhood: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  status: ReportStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  created_by: string | null;
  is_super_admin: boolean;
}

export const statusLabels: Record<ReportStatus, string> = {
  i_ri: 'I Ri',
  ne_proces: 'Në Proces',
  perfunduar: 'Përfunduar',
};

export const statusColors: Record<ReportStatus, string> = {
  i_ri: 'status-badge-new',
  ne_proces: 'status-badge-process',
  perfunduar: 'status-badge-done',
};
