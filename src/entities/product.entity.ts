import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DressStyle } from '../common/enums/dress-style.enum';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from './review.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountPrice: string | null;

  @Column('int', { nullable: true })
  discountPercentage: number | null;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: string;

  @Column('int', { default: 0 })
  stockQuantity: number;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  images: string[];

  @Column({ type: 'enum', enum: DressStyle })
  style: DressStyle;

  @Column('int', { default: 0 })
  salesCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => Category, (c) => c.products, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];

  @OneToMany(() => Review, (r) => r.product)
  reviews: Review[];
}
