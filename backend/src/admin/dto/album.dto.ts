import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AlbumTrackDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  songId!: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'У трека должен быть хотя бы один артист' })
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  artistIds!: number[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  trackNumber!: number;
}

export class AlbumDto {
  @IsString()
  @MinLength(1, { message: 'У альбома должно быть название' })
  @MaxLength(150, { message: 'Название альбома слишком длинное' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Жанр слишком длинный' })
  genre?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Неверная дата релиза' })
  releaseDate?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Название дистрибуции слишком длинное' })
  distributionName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlbumTrackDto)
  tracks!: AlbumTrackDto[];
}
