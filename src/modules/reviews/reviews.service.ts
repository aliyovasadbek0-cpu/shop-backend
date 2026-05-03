import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { Product } from '../../entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateReviewForProductDto } from '../products/dto/create-review-for-product.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly repo: Repository<Review>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async create(dto: CreateReviewDto) {
    if (dto.productId != null) {
      const exists = await this.products.exist({ where: { id: dto.productId } });
      if (!exists) throw new NotFoundException('Product not found');
    }
    const row = this.repo.create({
      userName: dto.userName,
      rating: dto.rating,
      comment: dto.comment,
      isVerified: dto.isVerified ?? false,
      isFeatured: dto.isFeatured ?? false,
      reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : null,
      productId: dto.productId ?? null,
    });
    return this.repo.save(row);
  }

  async createForProduct(productId: number, dto: CreateReviewForProductDto) {
    const exists = await this.products.exist({ where: { id: productId } });
    if (!exists) throw new NotFoundException('Product not found');
    const row = this.repo.create({
      userName: dto.userName,
      rating: dto.rating,
      comment: dto.comment,
      isVerified: dto.isVerified ?? false,
      isFeatured: false,
      reviewedAt: new Date(),
      productId,
    });
    return this.repo.save(row);
  }

  findFeaturedTestimonials() {
    return this.repo.find({
      where: { isFeatured: true },
      order: { createdAt: 'DESC' },
    });
  }

  findAllForHomepage() {
    return this.findFeaturedTestimonials();
  }

  findByProduct(productId: number) {
    return this.repo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Review not found');
    return row;
  }

  async update(id: number, dto: UpdateReviewDto) {
    const row = await this.findOne(id);
    if (dto.productId !== undefined) {
      if (dto.productId != null) {
        const ok = await this.products.exist({ where: { id: dto.productId } });
        if (!ok) throw new NotFoundException('Product not found');
      }
      row.productId = dto.productId;
    }
    if (dto.userName !== undefined) row.userName = dto.userName;
    if (dto.rating !== undefined) row.rating = dto.rating;
    if (dto.comment !== undefined) row.comment = dto.comment;
    if (dto.isVerified !== undefined) row.isVerified = dto.isVerified;
    if (dto.isFeatured !== undefined) row.isFeatured = dto.isFeatured;
    if (dto.reviewedAt !== undefined)
      row.reviewedAt = dto.reviewedAt ? new Date(dto.reviewedAt) : null;
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { deleted: true, id };
  }
}
