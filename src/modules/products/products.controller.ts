import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../common/enums/user-role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProductsService } from './products.service';
import { ReviewsService } from '../reviews/reviews.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateReviewForProductDto } from './dto/create-review-for-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get('new-arrivals')
  newArrivals() {
    return this.productsService.newArrivals(4);
  }

  @Get('top-selling')
  topSelling() {
    return this.productsService.topSelling(4);
  }

  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get(':id/related')
  related(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findRelated(id, 4);
  }

  @Get(':id/reviews')
  productReviews(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findByProduct(id);
  }

  @Post(':id/reviews')
  @UseGuards(AuthGuard('jwt'))
  addProductReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReviewForProductDto,
  ) {
    return this.reviewsService.createForProduct(id, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
