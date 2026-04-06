import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AlbumsService } from './albums.service';

@Controller('albums')
export class AlbumsController {
      constructor(private readonly appService: AlbumsService) {}
    
      @Get('')
      async getAllAlbums() {
        return await this.appService.getAlbums();
      }
    
      @Get(':id')
      async getAlbumById( @Param('id', ParseIntPipe) id: number ) {
        return await this.appService.getAlbumById(id);
      }
}
