import { SetMetadata } from '@nestjs/common';
import { Role as Roles } from '@prisma/client';

export const Role = (role: Roles) => SetMetadata('role', role);
