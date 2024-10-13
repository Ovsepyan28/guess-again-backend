import {
  AnswerOption,
  Frame,
  Game,
  GameStatus,
  Movie,
  Question,
  User,
} from '@prisma/client';

// Тип для ответа на создание новой игры
export type NewGameRequest = {
  gameId: Game['id'];
};

// Тип для состояния игры и текущего вопроса
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

// Тип для ответа на отправку ответа на вопрос
export type SubmitAnswerResponse = {
  selectedAnswerOptionId: AnswerOption['id'];
  correctAnswerId: AnswerOption['id'];
};

// Тип для данных о топ-игроках
export type TopPlayer = {
  userName: User['userName'];
  maxScore: User['maxScore'];
};
