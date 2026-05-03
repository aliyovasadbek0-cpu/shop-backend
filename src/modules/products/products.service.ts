import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSort, QueryProductsDto } from './dto/query-products.dto';
import { getEffectiveUnitPrice } from '../../common/utils/price.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  /** Yakuniy narx (chegirma bilan) — filter/sort uchun SQL */
  private effPriceSql(alias = 'p'): string {
    return `(CASE
      WHEN ${alias}."discountPrice" IS NOT NULL THEN ${alias}."discountPrice"::numeric
      WHEN ${alias}."discountPercentage" IS NOT NULL AND ${alias}."discountPercentage" > 0
        THEN ${alias}.price::numeric * (1 - ${alias}."discountPercentage"::numeric / 100)
      ELSE ${alias}.price::numeric
    END)`;
  }

  private applyProductFilters(
    qb: SelectQueryBuilder<Product>,
    query: QueryProductsDto,
    eff: string,
  ): void {
    if (query.categoryId) {
      qb.andWhere('p.categoryId = :cid', { cid: query.categoryId });
    }
    if (query.style) {
      qb.andWhere('p.style = :st', { st: query.style });
    }
    if (query.minPrice != null) {
      qb.andWhere(`${eff} >= :minP`, { minP: query.minPrice });
    }
    if (query.maxPrice != null) {
      qb.andWhere(`${eff} <= :maxP`, { maxP: query.maxPrice });
    }
    if (query.color?.trim()) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM product_variants v
          WHERE v."productId" = p.id AND LOWER(v.color) = LOWER(:col)
        )`,
        { col: query.color.trim() },
      );
    }
    if (query.size?.trim()) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM product_variants v2
          WHERE v2."productId" = p.id AND LOWER(v2.size) = LOWER(:sz)
        )`,
        { sz: query.size.trim() },
      );
    }
  }

  async create(dto: CreateProductDto) {
    const row = this.repo.create({
      name: dto.name.trim(),
      description: dto.description.trim(),
      price: dto.price.toFixed(2),
      discountPrice:
        dto.discountPrice != null ? dto.discountPrice.toFixed(2) : null,
      discountPercentage: dto.discountPercentage ?? null,
      rating: (dto.rating ?? 0).toFixed(2),
      stockQuantity: dto.stockQuantity ?? 0,
      images: dto.images ?? [],
      style: dto.style,
      categoryId: dto.categoryId ?? null,
      salesCount: 0,
    });
    return this.repo.save(row);
  }

  async findAll(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const sort = (query.sort ?? ProductSort.NEWEST) as ProductSort;
    const eff = this.effPriceSql('p');

    const countQb = this.repo.createQueryBuilder('p');
    this.applyProductFilters(countQb, query, eff);
    const total = await countQb.getCount();

    const dataQb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.variants', 'variants');

    this.applyProductFilters(dataQb, query, eff);

    switch (sort) {
      case ProductSort.PRICE_ASC:
        // PG: ORDER BY camelCase alias xato (effsort vs "effSort") — faqat kichik harf + _
        dataQb.addSelect(eff, 'sort_price');
        dataQb.orderBy('sort_price', 'ASC').addOrderBy('p.id', 'ASC');
        break;
      case ProductSort.PRICE_DESC:
        dataQb.addSelect(eff, 'sort_price');
        dataQb.orderBy('sort_price', 'DESC').addOrderBy('p.id', 'ASC');
        break;
      case ProductSort.POPULAR:
        dataQb.orderBy('p.salesCount', 'DESC').addOrderBy('p.id', 'ASC');
        break;
      case ProductSort.RATING:
        dataQb.orderBy('p.rating', 'DESC').addOrderBy('p.id', 'ASC');
        break;
      case ProductSort.NEWEST:
      default:
        dataQb.orderBy('p.createdAt', 'DESC').addOrderBy('p.id', 'ASC');
        break;
    }

    dataQb.skip((page - 1) * limit).take(limit);
    const data = await dataQb.getMany();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['category', 'variants', 'reviews'],
    });
    if (!row) throw new NotFoundException('Product not found');
    return {
      ...row,
      effectiveUnitPrice: getEffectiveUnitPrice(row),
    };
  }

  async findRelated(id: number, take = 4) {
    const product = await this.repo.findOne({
      where: { id },
      select: ['id', 'categoryId'],
    });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.categoryId) {
      return this.repo.find({
        where: { id: Not(id) },
        take,
        order: { salesCount: 'DESC' },
        relations: ['category', 'variants'],
      });
    }
    return this.repo.find({
      where: { categoryId: product.categoryId, id: Not(id) },
      take,
      relations: ['category', 'variants'],
      order: { salesCount: 'DESC' },
    });
  }

  newArrivals(take = 4) {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take,
      relations: ['category', 'variants'],
    });
  }

  topSelling(take = 4) {
    return this.repo.find({
      order: { salesCount: 'DESC', rating: 'DESC' },
      take,
      relations: ['category', 'variants'],
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Product not found');
    if (dto.name !== undefined) row.name = dto.name.trim();
    if (dto.description !== undefined) row.description = dto.description.trim();
    if (dto.price !== undefined) row.price = dto.price.toFixed(2);
    if (dto.discountPrice !== undefined) {
      row.discountPrice =
        dto.discountPrice === null ? null : dto.discountPrice.toFixed(2);
    }
    if (dto.discountPercentage !== undefined) {
      row.discountPercentage = dto.discountPercentage;
    }
    if (dto.rating !== undefined) row.rating = dto.rating.toFixed(2);
    if (dto.stockQuantity !== undefined) row.stockQuantity = dto.stockQuantity;
    if (dto.images !== undefined) row.images = dto.images;
    if (dto.style !== undefined) row.style = dto.style;
    if (dto.categoryId !== undefined) row.categoryId = dto.categoryId;
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Product not found');
    await this.repo.remove(row);
    return { deleted: true, id };
  }
}
