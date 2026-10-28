import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Role } from '../auth.constants'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as AuthUser
  },
)
