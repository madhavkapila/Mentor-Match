// UserRole type matching backend ROLE_HIERARCHY
export type UserRole = "viewer" | "editor" | "admin" | "super_admin";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
} as const;

export interface AuthUser {
  email: string;
  name: string;
  picture: string;
  role: UserRole;
}

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
