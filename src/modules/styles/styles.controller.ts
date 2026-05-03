import { Controller, Get } from '@nestjs/common';
import { DressStyle } from '../../common/enums/dress-style.enum';

@Controller('styles')
export class StylesController {
  @Get()
  list() {
    return Object.values(DressStyle);
  }
}
