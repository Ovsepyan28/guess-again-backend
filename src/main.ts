import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

// Загрузка переменных окружения из .env файла
dotenv.config();

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // Устанавливаем глобальный префикс
  app.setGlobalPrefix('api');

  // Включаем строгую валидацию данных, игнорируя любые неизвестные поля
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет неизвестные поля из данных
      forbidNonWhitelisted: true, // Бросает ошибку, если передано неизвестное поле
    }),
  );

  await app.listen(PORT, () => console.log('Server started on port ' + PORT));
}
bootstrap();
