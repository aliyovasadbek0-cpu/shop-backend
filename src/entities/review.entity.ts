import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Column('int')
  rating: number;

  @Column('text')
  comment: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column('date', { nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  productId: number | null;

  @ManyToOne(() => Product, (p) => p.reviews, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product | null;

  @CreateDateColumn()
  createdAt: Date;
}
