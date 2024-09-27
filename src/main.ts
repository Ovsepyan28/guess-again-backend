import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

// Загрузка переменных окружения из .env файла
dotenv.config();

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  // Устанавливаем глобальный префикс
  app.setGlobalPrefix('api');

  await app.listen(PORT, () => console.log('Server started on port ' + PORT));
}
bootstrap();
