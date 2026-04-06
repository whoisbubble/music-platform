import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get('albums')
  async getAllAlbums() {
    return await this.appService.getAlbums();
  }

  @Get('albums/:id')
  async getAlbumById( @Param('id', ParseIntPipe) id: number ) {
    return await this.appService.getAlbumById(id);
  }
}
