import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

// Выбираем, какой .env файл загружать в зависимости от режима (development или production)
const env = process.env.NODE_ENV || 'development';
dotenv.config({
  path: `.env.${env}`,
});

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  // Подключение Swagger
  const config = new DocumentBuilder()
    .setTitle('GuessAgain')
    .setDescription('API for GuessAgain')
    .setVersion('1.0.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

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
