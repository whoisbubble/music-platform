import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ArtistDto {
  @IsString()
  @MinLength(1, { message: 'У артиста должен быть nickname' })
  @MaxLength(100, { message: 'Nickname слишком длинный' })
  nickname!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'Полное имя слишком длинное' })
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Жанр слишком длинный' })
  mainGenre?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
