import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) {}

    async globalSearch(query: string, includeBanned: boolean) {

        if (!query) {
            return { albums: [], artists: [], songs: []};
        }

        const albums = await this.prisma.albums.findMany({
            where: { title: {
                contains: query, mode: 'insensitive'
            }},
            include: { asa_music: {
                include: {
                    artists: true
                }
            }}
        });

// 2. Ищем артистов
        const artists = await this.prisma.artists.findMany({
            where: { nickname: { contains: query, mode: 'insensitive' } }
        });

        // 3. Ищем песни (тут применяем фильтр is_banned)
        const songs = await this.prisma.songs.findMany({
            where: {
                title: { contains: query, mode: 'insensitive' },
                // ХИТРОСТЬ: если includeBanned = false, добавляем жесткое условие is_banned: false
                ...(includeBanned ? {} : { is_banned: false }) 
            }
        });

        return {albums, artists, songs};

    }
}
