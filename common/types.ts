export type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

export interface SuccessResponse {
  success: true;
  messages: React.ReactNode[];
  data?: any;
}

export interface FailedResponse {
  success: false;
  messages: React.ReactNode[];
  errTypes: string[];
}

export type Response = SuccessResponse | FailedResponse;

export interface ClientConfig {
  shouldServerSideRender: boolean;
  isProduction: boolean;
}
