import jwt from 'jsonwebtoken';

export class JwtService {
  private secret: string;
  private expiresIn: string;

  constructor(secret: string, expiresIn: string = '1h') {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.secret);
  }
}
