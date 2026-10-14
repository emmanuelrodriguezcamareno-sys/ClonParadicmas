import { OnGatewayConnection, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IncubatorsService } from './incubators.service';

// Empuja al navegador cada actualizacion en tiempo real.
@WebSocketGateway({ cors: { origin: true } })
export class EventsGateway implements OnModuleInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly incubators: IncubatorsService) {}

  onModuleInit() {
    this.incubators.updates$.subscribe((snapshot) => this.server.emit('incubator:update', snapshot));
  }

  handleConnection(client: Socket) {
    client.emit('incubators:snapshot', this.incubators.list());
  }
}
