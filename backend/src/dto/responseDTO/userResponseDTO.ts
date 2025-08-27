export class UserResponseDTO {
  private _id = "";
  private _email = "";
  private _firstName = "";
  private _lastName = "";

  // getter & setter
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }

  get email(): string {
    return this._email;
  }
  set email(value: string) {
    this._email = value;
  }

  get firstName(): string {
    return this._firstName;
  }
  set firstName(value: string) {
    this._firstName = value;
  }

  get lastName(): string {
    return this._lastName;
  }
  set lastName(value: string) {
    this._lastName = value;
  }

  toPlain() {
    return {
      id: this._id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
    };
  }
}
