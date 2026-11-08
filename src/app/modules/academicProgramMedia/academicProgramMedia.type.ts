export const AcademicProgramMediaType = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
} as const;

export type AcademicProgramMediaType =
  (typeof AcademicProgramMediaType)[keyof typeof AcademicProgramMediaType];

export const SectionMediaSection = {
  ACADEMIC_PROGRAMS: 'ACADEMIC_PROGRAMS',
  CO_CURRICULUM_ACTIVITIES: 'CO_CURRICULUM_ACTIVITIES',
} as const;

export type SectionMediaSection =
  (typeof SectionMediaSection)[keyof typeof SectionMediaSection];

export function normalizeSection(
  raw?: string | null,
): SectionMediaSection {
  if (!raw) return SectionMediaSection.ACADEMIC_PROGRAMS;
  const normalized = String(raw).trim().toUpperCase().replace(/-/g, '_');
  if (
    Object.values(SectionMediaSection).includes(
      normalized as SectionMediaSection,
    )
  ) {
    return normalized as SectionMediaSection;
  }
  // Allow legacy kebab values like "co-curriculum-activities"
  if (normalized === 'CO_CURRICULUM_ACTIVITIES')
    return SectionMediaSection.CO_CURRICULUM_ACTIVITIES;
  return SectionMediaSection.ACADEMIC_PROGRAMS;
}

export interface IAcademicProgramMediaCreate {
  section?: SectionMediaSection | string;
  type: AcademicProgramMediaType;
  title: string;
  captureDate: string | Date;
  fileUrl?: string | null;
  videoUrl?: string | null;
}

export interface IAcademicProgramMediaUpdate {
  title?: string;
  captureDate?: string | Date;
  fileUrl?: string | null;
  videoUrl?: string | null;
}
