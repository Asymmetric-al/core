export class SupportCannedResponseError extends Error {
  constructor(
    message: string,
    readonly status = 422,
  ) {
    super(message);
    this.name = "SupportCannedResponseError";
  }
}
