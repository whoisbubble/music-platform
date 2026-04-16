export interface AuthUser {
  sub: number;
  email: string;
  username: string;
  roles: string[];
  iat?: number;
  exp?: number;
}
