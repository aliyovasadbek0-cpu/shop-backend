import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { ReviewsModule } from '../reviews/reviews.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant]),
    ReviewsModule,
  ],
  controllers: [ProductsController, ProductVariantsController],
  providers: [ProductsService, ProductVariantsService],
  exports: [ProductsService],
})
export class ProductsModule {}
