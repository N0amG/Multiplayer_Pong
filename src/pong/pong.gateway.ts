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
    private game: Game;

    handleDisconnect(client: Socket) {
        console.log('Client déconnecté :', client.id);
        // Retirer le client du tableau
        this.connectedClients = this.connectedClients.filter(
            (id) => id !== client.id,
        );
        console.log('Clients restants :', this.connectedClients);
    }

    @SubscribeMessage('open')
    handleOpen(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
        console.log('Message reçu:', data);
        // Ajouter l'ID du client au tableau s'il n'est pas déjà présent
        if (!this.connectedClients.includes(client.id)) {
            this.connectedClients.push(client.id);
        }
        console.log('Clients connectés :', this.connectedClients);

        // Initialiser le jeu avec les deux joueurs
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
            // Envoyer à chaque client son rôle
            [this.connectedClients[0], this.connectedClients[1]].forEach(
                (clientId, idx) => {
                    const role = idx === 0 ? 'player1' : 'player2';
                    this.server.to(clientId).emit('gameStarted', {
                        message: 'Partie démarrée',
                        role,
                        players: {
                            player1: player1.getPosition(),
                            player2: player2.getPosition(),
                            score: this.game.getScore(),
                        },
                    });
                },
            );
        } else {
            // Si moins de 2 joueurs, envoyer un message d'attente
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
        // Ici tu peux gérer la position du paddle reçue
        const playerIndex = this.connectedClients.indexOf(client.id);
        const playerLabel =
            playerIndex === 0
                ? 'player1'
                : playerIndex === 1
                  ? 'player2'
                  : 'unknown';
        console.log(`${playerLabel} mousepos = ${data.paddleY}`); // Affiche la position du paddle
        if (!this.game) {
            console.error("Le jeu n'est pas initialisé.");
            return;
        }
        // Mettre à jour la position du joueur en fonction de la souris
        if (playerIndex === 0) {
            this.game.player1.move(data.paddleY, 500);
        } else if (playerIndex === 1) {
            this.game.player2.move(data.paddleY, 500);
        }
    }
    handleUpdateGame() {
        if (this.game) {
            // Mettre à jour la position de la balle et vérifier les collisions
            this.game.update();
            // Envoyer les positions mises à jour aux clients
            this.server.emit('gameUpdate', {
                players: {
                    player1: this.game.player1.getPosition(),
                    player2: this.game.player2.getPosition(),
                },
                ball: this.game.getBallPosition(),
                score: this.game.getScore(),
            });
        }
    }
    handleUpdateGameLoop() {
        // Mettre à jour le jeu toutes les 16ms (environ 60 FPS)
        setInterval(() => {
            this.handleUpdateGame();
        }, 8);
    }
    afterInit(server: Server) {
        console.log('WebSocket server initialized');
        this.handleUpdateGameLoop(); // Démarrer la boucle de mise à jour du jeu
    }
}
