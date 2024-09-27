import { Injectable } from '@nestjs/common';
import {
  AnswerOption,
  Frame,
  Game,
  Movie,
  Question as QuestionModel,
} from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

import { Question } from './questions.interfaces';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(gameId: Game['id']): Promise<Question> {
    // Получаем 4 случайных фильма
    const randomMovies: Movie[] = await this.prisma.$queryRaw`
      SELECT * FROM "Movie"
      ORDER BY RANDOM()
      LIMIT 4
    `;

    // Выбираем один случайный фильм как правильный ответ
    const correctMovie: Movie =
      randomMovies[Math.floor(Math.random() * randomMovies.length)];

    // Находим случайный кадр из выбранного фильма
    const [correctFrame]: Frame[] = await this.prisma.$queryRaw`
      SELECT * FROM "Frame"
      WHERE "movieId" = ${correctMovie.id}
      ORDER BY RANDOM()
      LIMIT 1
    `;

    // Создаем новый вопрос
    const question: QuestionModel = await this.prisma.question.create({
      data: {
        gameId,
        frameId: correctFrame.id,
        correctAnswerId: '', // Идентификатор правильного варианта ответа еще не известен
      },
    });

    // Создаем варианты ответов (AnswerOption) для каждого фильма
    const answerOptions = await Promise.all(
      randomMovies.map(async (movie) => {
        const answerOption: AnswerOption =
          await this.prisma.answerOption.create({
            data: {
              questionId: question.id,
              movieId: movie.id,
            },
          });

        return {
          answerOptionId: answerOption.id,
          title: movie.title,
          year: movie.year,
        };
      }),
    );

    // Обновляем вопрос с правильным ответом
    await this.prisma.question.update({
      where: { id: question.id },
      data: {
        correctAnswerId: answerOptions.find(
          (option) => option.title === correctMovie.title,
        )?.answerOptionId,
      },
    });

    // Возвращаем финальный объект
    return {
      id: question.id,
      imageUrl: correctFrame.imageUrl,
      correctAnswerId: question.correctAnswerId,
      answerOptions: answerOptions,
    };
  }
}
