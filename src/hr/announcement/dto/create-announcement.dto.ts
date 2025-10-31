export enum AnnouncementType {
  URGENT = 'URGENT',
  DAILY = 'DAILY',
}

export class CreateAnnouncementDto {
  announcement_type: AnnouncementType;
  title: string;
  note: string;
}
