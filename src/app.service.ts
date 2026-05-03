import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: 'shop-backend',
      prefix: '/api',
      hint: 'Figma SHOP.CO — mahsulotlar, savat, buyurtmalar.',
    };
  }
}
