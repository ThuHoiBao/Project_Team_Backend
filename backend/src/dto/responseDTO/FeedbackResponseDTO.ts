export class FeedbackResponseDTO {
  private _rating: string = '';
  private _comment: string = '';
  private _imageFeedbacks: string[] = [];
  private _date!: Date; // sẽ được gán khi set
  private _userName: string = '';
  private _imageUser: string = '';
  private _imageProduct: string = '';
  private _productName: string = '';

  // --- rating ---
  get rating(): string {
    return this._rating;
  }
  set rating(value: string) {
    this._rating = value;
  }

  // --- comment ---
  get comment(): string {
    return this._comment;
  }
  set comment(value: string) {
    this._comment = value;
  }

  // --- date ---
  get date(): Date {
    return this._date;
  }
  set date(value: Date) {
    this._date = value;
  }

  // --- imageFeedbacks ---
  get imageFeedbacks(): string[] {
    return this._imageFeedbacks;
  }
  set imageFeedbacks(value: string[]) {
    this._imageFeedbacks = value;
  }

  // --- userName ---
  get userName(): string {
    return this._userName;
  }
  set userName(value: string) {
    this._userName = value;
  }

  // --- imageUser ---
  get imageUser(): string {
    return this._imageUser;
  }
  set imageUser(value: string) {
    this._imageUser = value;
  }

  // --- imageProduct ---
  get imageProduct(): string {
    return this._imageProduct;
  }
  set imageProduct(value: string) {
    this._imageProduct = value;
  }

  // --- productName ---
  get productName(): string {
    return this._productName;
  }
  set productName(value: string) {
    this._productName = value;
  }

  // Convert DTO -> plain object (trả về API)
  toPlain() {
    return {
      rating: this._rating,
      comment: this._comment,
      imageFeedbacks: this._imageFeedbacks,
      date: this._date,
      userName: this._userName,
      imageUser: this._imageUser,
      imageProduct: this._imageProduct,
      productName: this._productName,
    };
  }
}
