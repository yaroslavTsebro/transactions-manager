export { };

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      PORT: number;
      DATABASE: string;
      HOST: string;
      USER: string;
      PASSWORD: string;
    }
  }
}
