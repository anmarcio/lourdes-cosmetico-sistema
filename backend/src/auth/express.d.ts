declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: number;
        username: string;
      };
    }
  }
}

export {};