export const ONE_SEND_REFUSED = "ASYM_ONE_SEND_REFUSED";

export type OneSendHeaders = Record<string, string | string[]>;

export type OneSendResponse = {
  getStatusCode(): number;
  getHeaders(): OneSendHeaders;
  getRawResponse(): unknown;
  toStream(streamCompleteCallback: () => void): unknown;
  toJSON(): Promise<unknown>;
};

export type OneSendTransport = {
  getClientName(): string;
  makeRequest(
    host: string,
    port: string,
    path: string,
    method: string,
    headers: Record<string, string | number | string[]>,
    requestData: string,
    protocol: string,
    timeout: number,
  ): Promise<OneSendResponse>;
};

export type OneSend = {
  client: OneSendTransport;
  status(): number | undefined;
  headers(): OneSendHeaders | undefined;
  calls(): number;
};

export function createOneSend(transport: OneSendTransport): OneSend {
  let calls = 0;
  let status: number | undefined;
  let headers: OneSendHeaders | undefined;
  const client: OneSendTransport = {
    getClientName: () => transport.getClientName(),
    async makeRequest(
      host,
      port,
      path,
      method,
      requestHeaders,
      requestData,
      protocol,
      timeout,
    ) {
      calls += 1;
      if (calls > 1)
        throw Object.assign(
          new Error("This call already sent its one request to the provider."),
          { code: ONE_SEND_REFUSED },
        );
      const response = await transport.makeRequest(
        host,
        port,
        path,
        method,
        requestHeaders,
        requestData,
        protocol,
        timeout,
      );
      status = response.getStatusCode();
      headers = response.getHeaders();
      return response;
    },
  };
  return {
    client,
    status: () => status,
    headers: () => headers,
    calls: () => calls,
  };
}
