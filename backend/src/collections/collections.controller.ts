import { Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get('me')
  getMyCollection(@CurrentUser() user: AuthUser) {
    return this.collectionsService.getMyCollection(user.sub);
  }

  @Get('me/state')
  getCollectionState(@CurrentUser() user: AuthUser) {
    return this.collectionsService.getCollectionState(user.sub);
  }

  @Post('me/albums/:albumId')
  addAlbum(
    @CurrentUser() user: AuthUser,
    @Param('albumId', ParseIntPipe) albumId: number,
  ) {
    return this.collectionsService.addAlbum(user.sub, albumId);
  }

  @Delete('me/albums/:albumId')
  removeAlbum(
    @CurrentUser() user: AuthUser,
    @Param('albumId', ParseIntPipe) albumId: number,
  ) {
    return this.collectionsService.removeAlbum(user.sub, albumId);
  }

  @Post('me/songs/:songId')
  addSong(@CurrentUser() user: AuthUser, @Param('songId', ParseIntPipe) songId: number) {
    return this.collectionsService.addSong(user.sub, songId);
  }

  @Delete('me/songs/:songId')
  removeSong(@CurrentUser() user: AuthUser, @Param('songId', ParseIntPipe) songId: number) {
    return this.collectionsService.removeSong(user.sub, songId);
  }
}
