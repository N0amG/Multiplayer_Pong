import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class PongGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('open')
  handleOpen(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    console.log('Message reçu:', data);
    client.emit('open', `Server received: ${data}`);
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() data: { paddleY: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Ici tu peux gérer la position du paddle reçue
    console.log('Paddle position reçue:', data.paddleY);
    // Optionnel : broadcast à l'autre joueur
    // this.server.emit('opponentMove', { paddleY: data.paddleY });
  }
}
