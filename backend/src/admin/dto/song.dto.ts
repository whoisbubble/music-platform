import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SongDto {
  @IsString()
  @MinLength(1, { message: 'У трека должно быть название' })
  @MaxLength(150, { message: 'Название трека слишком длинное' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Жанр слишком длинный' })
  genre?: string;

  @IsOptional()
  @IsString()
  audioLink?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Неверная дата создания трека' })
  creationDate?: string;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;
}
