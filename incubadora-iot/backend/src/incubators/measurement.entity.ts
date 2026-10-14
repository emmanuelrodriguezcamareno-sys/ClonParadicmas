import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('measurements')
@Index(['incubatorId', 'createdAt'])
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  incubatorId!: string;

  @Column('float')
  temperature!: number;

  @Column('float')
  humidity!: number;

  @Column({ default: 'esp32' })
  source!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
