import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '../auth.constants'
import { AuthUser, ROLES_KEY } from '../decorators/auth.decorators'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required?.length) return true

    const user = context.switchToHttp().getRequest().user as AuthUser | undefined
    if (!user) return false
    if (user.role === 'owner') return true
    if (!required.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to perform this action')
    }
    return true
  }
}
