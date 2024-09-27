import {
  AnswerOption,
  Frame,
  Movie,
  Question as QuestionModel,
} from '@prisma/client';

export type Question = {
  id: QuestionModel['id'];
  imageUrl: Frame['imageUrl'];
  correctAnswerId: AnswerOption['id'];
  answerOptions: {
    answerOptionId: AnswerOption['id'];
    title: Movie['title'];
    year: Movie['year'];
  }[];
};
