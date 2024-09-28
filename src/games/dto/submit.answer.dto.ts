import { AnswerOption, Game, Question } from '@prisma/client';

export class SubmitAnswerDto {
  gameId: Game['id']; // Идентификатор игры
  questionId: Question['id']; // Идентификатор вопроса
  selectedAnswerOption: AnswerOption['id']; // Идентификатор выбранного ответа
}
