import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MatchesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ScoringGateway');
  private clientRooms: Map<string, string[]> = new Map(); // clientId -> [roomIds]

  constructor() {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientRooms.set(client.id, []);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientRooms.delete(client.id);
  }

  @SubscribeMessage('join_match')
  handleJoinMatch(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { matchId } = data;
    const roomName = `match_${matchId}`;
    
    client.join(roomName);
    
    // Track rooms for this client
    const clientRooms = this.clientRooms.get(client.id) || [];
    if (!clientRooms.includes(roomName)) {
      clientRooms.push(roomName);
      this.clientRooms.set(client.id, clientRooms);
    }

    this.logger.log(`Client ${client.id} joined match room: ${roomName}`);

    // Acknowledge the join - scoring data will be sent when received
    client.emit('joined_match', { matchId, message: 'Joined match room. Waiting for scoring data...' });
  }

  @SubscribeMessage('leave_match')
  handleLeaveMatch(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { matchId } = data;
    const roomName = `match_${matchId}`;
    
    client.leave(roomName);
    
    // Remove room from client tracking
    const clientRooms = this.clientRooms.get(client.id) || [];
    const updatedRooms = clientRooms.filter(room => room !== roomName);
    this.clientRooms.set(client.id, updatedRooms);

    this.logger.log(`Client ${client.id} left match room: ${roomName}`);
  }

  @SubscribeMessage('join_court')
  handleJoinCourt(
    @MessageBody() data: { courtId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { courtId } = data;
    const roomName = `court_${courtId}`;
    
    client.join(roomName);
    
    // Track rooms for this client
    const clientRooms = this.clientRooms.get(client.id) || [];
    if (!clientRooms.includes(roomName)) {
      clientRooms.push(roomName);
      this.clientRooms.set(client.id, clientRooms);
    }

    this.logger.log(`Client ${client.id} joined court room: ${roomName}`);

    // Acknowledge the join - scoring data will be broadcast to this room when received
    client.emit('joined_court', { courtId, message: 'Joined court room. Waiting for scoring data...' });
  }

  // Method to broadcast score updates
  broadcastScoreUpdate(matchId: string, scoreboardData: any) {
    const roomName = `match_${matchId}`;
    this.server.to(roomName).emit('score_update', scoreboardData);
    
    // Also broadcast to all court rooms since we don't know which court
    this.server.emit('score_update', { matchId, ...scoreboardData });
    
    this.logger.log(`Broadcasted score update for match ${matchId} to room ${roomName}`);
  }
}
