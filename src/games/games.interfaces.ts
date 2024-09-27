import { AnswerOption, Frame, Game, Movie, Question } from '@prisma/client';

export type GameQuestionState = {
  gameId: Game['id'];
  lives: Game['lives'];
  score: Game['score'];
  status: GameStatus;
  questionId?: Question['id'];
  imageUrl?: Frame['imageUrl'];
  answerOptions?: {
    answerOptionId: AnswerOption['id'];
    title: Movie['title'];
    year: Movie['year'];
  }[];
};

export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}
