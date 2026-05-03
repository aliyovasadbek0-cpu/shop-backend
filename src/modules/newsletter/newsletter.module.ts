import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriber } from '../../entities/subscriber.entity';
import { NewsletterService } from './newsletter.service';
import { SubscribeController } from './subscribe.controller';
import { SubscribersController } from './subscribers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  controllers: [SubscribeController, SubscribersController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
