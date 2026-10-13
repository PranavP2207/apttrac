export class DomainError extends Error {
  constructor(
    public status: 400 | 404 | 409,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}
