import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { USER_ROLE } from '../constants/enums';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Access denied: Authentication required');
    }

    if (user.role?.toLowerCase() !== USER_ROLE.ADMIN) {
      throw new ForbiddenException('Access denied: Admin privileges required');
    }

    return true;
  }
}