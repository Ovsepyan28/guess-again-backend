import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

dotenv.config(); // Загрузка переменных окружения из .env файла

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // Подключение middleware для парсинга cookie из запросов

  app.setGlobalPrefix('api'); // Установка глобального префикса

  // Включение строгой валидации данных, игнорируя любые неизвестные поля
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаление неизвестных полей из данных
      forbidNonWhitelisted: true, // Бросание ошибки, если в запросе содержатся неизвестные поля
    }),
  );

  await app.listen(PORT, () => console.log('Server started on port ' + PORT));
}

bootstrap();
