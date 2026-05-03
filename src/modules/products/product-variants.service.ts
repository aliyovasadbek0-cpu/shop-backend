import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Product } from '../../entities/product.entity';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  private async assertProduct(productId: number) {
    const p = await this.productRepo.findOne({ where: { id: productId } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async create(productId: number, dto: CreateVariantDto) {
    await this.assertProduct(productId);
    const row = this.variantRepo.create({
      productId,
      color: dto.color.trim(),
      size: dto.size.trim(),
      stockQuantity: dto.stockQuantity ?? 0,
    });
    return this.variantRepo.save(row);
  }

  async findAllByProduct(productId: number) {
    await this.assertProduct(productId);
    return this.variantRepo.find({
      where: { productId },
      order: { size: 'ASC', color: 'ASC' },
    });
  }

  async findOne(productId: number, variantId: number) {
    await this.assertProduct(productId);
    const row = await this.variantRepo.findOne({
      where: { id: variantId, productId },
    });
    if (!row) throw new NotFoundException('Variant not found');
    return row;
  }

  async update(productId: number, variantId: number, dto: UpdateVariantDto) {
    const row = await this.findOne(productId, variantId);
    if (dto.color !== undefined) row.color = dto.color.trim();
    if (dto.size !== undefined) row.size = dto.size.trim();
    if (dto.stockQuantity !== undefined) row.stockQuantity = dto.stockQuantity;
    return this.variantRepo.save(row);
  }

  async remove(productId: number, variantId: number) {
    const row = await this.findOne(productId, variantId);
    await this.variantRepo.remove(row);
    return { deleted: true, id: variantId };
  }
}
