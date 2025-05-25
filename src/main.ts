import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app)); // ← obligatoire !
  app.enableCors({ origin: '*' }); // pour HTTP
  await app.listen(3000);
  console.log('WebSocket server started');
}
void bootstrap();
