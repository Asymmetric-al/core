import type { TwentyCoreClient, TwentyRequestOptions } from "./core";

type MetadataRequestOptions = Omit<TwentyRequestOptions, "path"> & {
  path: string;
};

export class TwentyMetadataClient {
  constructor(private readonly coreClient: TwentyCoreClient) {}

  request<TResponse = unknown>(
    options: MetadataRequestOptions,
  ): Promise<TResponse> {
    const metadataPath = options.path.startsWith("/")
      ? `/metadata${options.path}`
      : `/metadata/${options.path}`;

    return this.coreClient.request<TResponse>({
      ...options,
      path: metadataPath,
    });
  }

  listObjects<TResponse = unknown>(): Promise<TResponse> {
    return this.request<TResponse>({
      method: "GET",
      path: "/objects",
    });
  }
}
