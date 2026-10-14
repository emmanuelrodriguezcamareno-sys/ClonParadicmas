import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncubatorsModule } from './incubators/incubators.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres' as const,
        host: c.get('DB_HOST', 'localhost'),
        port: Number(c.get('DB_PORT', 5432)),
        username: c.get('DB_USER', 'incubadora'),
        password: c.get('DB_PASSWORD', 'incubadora'),
        database: c.get('DB_NAME', 'incubadora'),
        autoLoadEntities: true,
        // Solo para desarrollo: crea las tablas automaticamente.
        // En produccion usar migraciones.
        synchronize: true,
      }),
    }),
    IncubatorsModule,
  ],
})
export class AppModule {}
