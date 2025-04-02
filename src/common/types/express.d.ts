import { User } from '../../modules/users/entities/user.entity';

declare module 'express' {
  interface Request {
    user?: User;
  }
}
