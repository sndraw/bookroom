export interface Tool {
  name: string;
  version: string;
  description: string;
  parameters: any;
  returns?: any;
  execute: (args: any, context?: any) => Promise<any>;
}