import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get('albums')
  async getAllAlbums() {
    return await this.appService.getAlbums();
  }
}
