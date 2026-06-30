import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { USER_ROLE } from '../constants/enums';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Access denied: Authentication required');
    }

    // Check if user has ADMIN role
    if (user.role?.toLowerCase() !== USER_ROLE.ADMIN) {
      throw new ForbiddenException('Access denied: Admin privileges required');
    }

    // Check if this is an admin session (token generated via admin login)
    if (!user.isAdminSession) {
      throw new ForbiddenException(
        'Access denied: Please use the admin login endpoint at /auth/admin/login',
      );
    }

    return true;
  }
}