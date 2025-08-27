export class RegisterUserRequestDTO {
  private _email = "";
  private _password = "";
  private _firstName = "";
  private _lastName = "";
  private _otp = "";

  // getter & setter
  get email(): string {
    return this._email;
  }
  set email(value: string) {
    this._email = value;
  }

  get password(): string {
    return this._password;
  }
  set password(value: string) {
    this._password = value;
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

  get otp(): string {
    return this._otp;
  }
  set otp(value: string) {
    this._otp = value;
  }

  // convert sang plain object (để map/lưu DB)
  toPlain() {
    return {
      email: this._email,
      password: this._password,
      firstName: this._firstName,
      lastName: this._lastName,
      otp: this._otp,
    };
  }
}
