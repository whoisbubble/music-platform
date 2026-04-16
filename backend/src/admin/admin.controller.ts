import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ArtistDto } from './dto/artist.dto';
import { SongDto } from './dto/song.dto';
import { AlbumDto } from './dto/album.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('artists')
  getArtists() {
    return this.adminService.getArtists();
  }

  @Post('artists')
  createArtist(@Body() dto: ArtistDto) {
    return this.adminService.createArtist(dto);
  }

  @Patch('artists/:id')
  updateArtist(@Param('id', ParseIntPipe) id: number, @Body() dto: ArtistDto) {
    return this.adminService.updateArtist(id, dto);
  }

  @Delete('artists/:id')
  deleteArtist(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteArtist(id);
  }

  @Get('songs')
  getSongs() {
    return this.adminService.getSongs();
  }

  @Post('songs')
  createSong(@Body() dto: SongDto) {
    return this.adminService.createSong(dto);
  }

  @Patch('songs/:id')
  updateSong(@Param('id', ParseIntPipe) id: number, @Body() dto: SongDto) {
    return this.adminService.updateSong(id, dto);
  }

  @Delete('songs/:id')
  deleteSong(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteSong(id);
  }

  @Get('albums')
  getAlbums() {
    return this.adminService.getAlbums();
  }

  @Get('albums/:id')
  getAlbum(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getAlbum(id);
  }

  @Post('albums')
  createAlbum(@Body() dto: AlbumDto) {
    return this.adminService.createAlbum(dto);
  }

  @Patch('albums/:id')
  updateAlbum(@Param('id', ParseIntPipe) id: number, @Body() dto: AlbumDto) {
    return this.adminService.updateAlbum(id, dto);
  }

  @Delete('albums/:id')
  deleteAlbum(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteAlbum(id);
  }
}
