import { AnnouncementType } from './create-announcement.dto';

export class UpdateAnnouncementDto {
  announcement_type?: AnnouncementType;
  title?: string;
  note?: string;
}
