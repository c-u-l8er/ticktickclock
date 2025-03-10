declare module "@clerk/clerk-js" {
  export class Clerk {
    constructor(publishableKey: string);
    load(): Promise<void>;
    loaded: boolean;
    signIn: {
      create(params: { identifier: string; password: string }): Promise<any>;
    };
    signUp: {
      create(params: { emailAddress: string; password: string }): Promise<any>;
    };
  }
}
