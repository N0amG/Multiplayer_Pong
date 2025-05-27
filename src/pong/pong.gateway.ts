import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game } from './game/game';
import { Player } from './game/player';

@WebSocketGateway({ cors: { origin: '*' } })
export class PongGateway {
    @WebSocketServer()
    server: Server;

    // Tableau pour stocker les IDs des clients connectés
    private connectedClients: string[] = [];
    private game: Game | null = null;

    handleDisconnect(client: Socket) {
        console.log('Client déconnecté :', client.id);
        this.connectedClients = this.connectedClients.filter(
            (id) => id !== client.id,
        );
        if (this.game) {
            if (this.connectedClients.length < 2) {
                console.log('Un joueur a quitté, fin de la partie.');
                let data = this.game.gameEnd("Un joueur s'est déconnecté");
                this.server.emit('gameEnded', {
                    message: data.reason,
                    winner: data.winner,
                    finalScore: data.finalScore,
                });
                this.game = null; // Détruire la partie
            }
            console.log('Clients restants :', this.connectedClients);
        }
    }

    @SubscribeMessage('open')
    handleOpen(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
        console.log('Message reçu:', data);
        if (!this.connectedClients.includes(client.id)) {
            this.connectedClients.push(client.id);
        }
        console.log('Clients connectés :', this.connectedClients);

        if (this.connectedClients.length === 2) {
            const player1 = new Player(this.connectedClients[0], 50, 200);
            const player2 = new Player(this.connectedClients[1], 730, 200);
            this.game = new Game(player1, player2);
            console.log(
                'Partie initialisée avec les joueurs:',
                player1.id,
                'et',
                player2.id,
            );
            [this.connectedClients[0], this.connectedClients[1]].forEach(
                (clientId, idx) => {
                    const role = idx === 0 ? 'player1' : 'player2';
                    this.server.to(clientId).emit('gameStarted', {
                        message: 'Partie démarrée',
                        role,
                        players: {
                            player1: player1.getPosition(),
                            player2: player2.getPosition(),
                            score: this.game!.getScore(),
                        },
                    });
                },
            );
        } else {
            this.server.emit('waitingForPlayers', {
                message:
                    "En attente d'un autre joueur pour commencer la partie",
                connectedPlayers: this.connectedClients.length,
            });
        }
    }

    @SubscribeMessage('move')
    handleMove(
        @MessageBody() data: { paddleY: number },
        @ConnectedSocket() client: Socket,
    ) {
        if (!this.game) {
            // Partie non initialisée
            return;
        }
        const playerIndex = this.connectedClients.indexOf(client.id);
        if (playerIndex === 0) {
            this.game.player1.move(data.paddleY);
        } else if (playerIndex === 1) {
            this.game.player2.move(data.paddleY);
        }
    }

    handleUpdateGame() {
        if (!this.game) {
            return;
        }
        this.game.update();
        this.server.emit('gameUpdate', {
            players: {
                player1: this.game.player1.getPosition(),
                player2: this.game.player2.getPosition(),
            },
            ball: this.game.getBallPosition(),
            score: this.game.getScore(),
        });
    }

    handleUpdateGameLoop() {
        setInterval(() => {
            this.handleUpdateGame();
        }, 8);
    }

    afterInit(server: Server) {
        console.log('WebSocket server initialized');
        this.handleUpdateGameLoop();
    }
}
