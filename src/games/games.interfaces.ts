import {
  AnswerOption,
  Frame,
  Game,
  GameStatus,
  Movie,
  Question,
  User,
} from '@prisma/client';

export type NewGameRequest = {
  gameId: Game['id'];
};

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

export type SubmitAnswerResponse = {
  selectedAnswerOptionId: AnswerOption['id'];
  correctAnswerId: AnswerOption['id'];
};

export type TopPlayer = {
  userName: User['userName'];
  maxScore: User['maxScore'];
};
