import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../common/enums/order-status.enum';
import { OrderLine } from './order-line.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sessionId: string | null;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: string;

  @Column('decimal', { precision: 10, scale: 2, default: '0' })
  discountAmount: string;

  @Column('decimal', { precision: 10, scale: 2, default: '0' })
  deliveryFee: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  promoCode: string | null;

  @OneToMany(() => OrderLine, (l) => l.order, { cascade: true })
  lines: OrderLine[];

  @CreateDateColumn()
  createdAt: Date;
}
