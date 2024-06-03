export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export interface RefFiFunctionCallOptions {
  methodName: string;
  args?: object;
  gas?: string;
  amount?: string;
}
