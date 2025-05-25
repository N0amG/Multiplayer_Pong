import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PongModule } from './pong/pong.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Chemin vers le dossier public
      // exclude: ['/api*'], // Optionnel : exclure les routes API
    }),
    PongModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
