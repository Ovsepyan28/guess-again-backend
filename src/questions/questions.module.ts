import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { QuestionsService } from './questions.service';

@Module({
  providers: [QuestionsService, PrismaService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
