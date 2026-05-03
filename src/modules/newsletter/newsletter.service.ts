import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from '../../entities/subscriber.entity';
import { SubscribeEmailDto } from './dto/subscribe-email.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly repo: Repository<Subscriber>,
  ) {}

  async subscribe(dto: SubscribeEmailDto) {
    const email = dto.email.trim().toLowerCase();
    const dup = await this.repo.findOne({ where: { email } });
    if (dup) return dup;
    const row = this.repo.create({ email });
    return this.repo.save(row);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Subscriber not found');
    return row;
  }

  async update(id: number, dto: UpdateSubscriberDto) {
    const row = await this.findOne(id);
    const email = dto.email.trim().toLowerCase();
    const dup = await this.repo.findOne({ where: { email } });
    if (dup && dup.id !== id) {
      throw new ConflictException('Bu email allaqachon mavjud');
    }
    row.email = email;
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { deleted: true, id };
  }
}
