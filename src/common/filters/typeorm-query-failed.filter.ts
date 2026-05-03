import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Postman / frontend uchun: duplicate, FK va boshqa PG xatolarini tushunarli JSON qaytaradi.
 */
@Catch(QueryFailedError)
export class TypeOrmQueryFailedFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmQueryFailedFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const driver = exception.driverError as
      | {
          code?: string;
          detail?: string;
          table?: string;
          constraint?: string;
          column?: string;
        }
      | undefined;

    const code = driver?.code ?? '';
    const detail = driver?.detail ?? exception.message;
    const table = driver?.table ?? '';
    const constraint = driver?.constraint ?? '';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message =
      "Ma'lumotlar bazasida kutilmagan xato. Keyinroq qayta urinib ko'ring.";

    switch (code) {
      case '23505': {
        status = HttpStatus.CONFLICT;
        message = this.duplicateMessage(table, detail);
        break;
      }
      case '23503': {
        status = HttpStatus.BAD_REQUEST;
        message =
          "Bog'liq yozuv (boshqa jadval) bilan ziddiyat: avval bog'liq ma'lumotlarni yangilang yoki o'chiring.";
        break;
      }
      case '23502': {
        status = HttpStatus.BAD_REQUEST;
        message =
          "Majburiy maydonlar to'liq emas yoki noto'g'ri qiymat yuborildi.";
        break;
      }
      case '22P02': {
        status = HttpStatus.BAD_REQUEST;
        message =
          "Noto'g'ri format (masalan, ID raqam bo'lishi kerak, matn emas).";
        break;
      }
      default: {
        if (code) {
          message = `Ma'lumotlar bazasi xatosi (kod: ${code}).`;
        }
        this.logger.error(
          `[${code}] ${exception.message} | query: ${exception.query}`,
        );
      }
    }

    if (code && code !== '23505') {
      this.logger.warn(`[${code}] table=${table} detail=${detail}`);
    } else if (code === '23505') {
      this.logger.warn(`Duplicate: ${detail}`);
    }

    const body: Record<string, unknown> = {
      statusCode: status,
      error: HttpStatus[status],
      message,
      dbCode: code || undefined,
      table: table || undefined,
      constraint: constraint || undefined,
    };

    if (detail && detail !== message) {
      body.detail = detail;
    }

    res.status(status).json(body);
  }

  private duplicateMessage(table: string, detail: string): string {
    const keyMatch = detail?.match(/Key \(([^)]+)\)=\(([^)]*)\)/);
    const field = keyMatch?.[1] ?? '';
    const value = keyMatch?.[2] ?? '';

    switch (table) {
      case 'categories':
        return `Bu nomdagi kategoriya allaqachon bor: "${value}". Boshqa nom tanlang.`;
      case 'subscribers':
        return `Bu email allaqachon ro'yxatdan o'tgan: "${value}".`;
      case 'products':
        return `Bu mahsulot bo'yicha takrorlanmas maydon (${field}) band. Qiymat: "${value}".`;
      default:
        if (field) {
          return `Takrorlanmas (${field}) maydoni uchun bu qiymat allaqachon mavjud: "${value}".`;
        }
        return "Bunday yozuv allaqachon mavjud (unique cheklov buzildi).";
    }
  }
}
