import jwt from 'jsonwebtoken';

export function canReadAnalytics(request: Request): boolean {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  const header = request.headers.get('authorization');
  if (!secret || !header?.startsWith('Bearer ')) return false;
  try {
    const user = jwt.verify(header.slice(7), secret, { algorithms: ['HS256'] });
    return typeof user !== 'string' && ['admin', 'editor'].includes(user.role);
  } catch { return false; }
}
