

export class OrderItemResponseDTO {
  private _id: string = '';
  private _productName: string = '';
  private _price: number = 0;
  private _image: string = '';
  private _quantity: string = '';
  private _size : string = '';

  // Getter và Setter methods

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get productName(): string {
    return this._productName;
  }

  set productName(value: string) {
    this._productName = value;
  }

  get price(): number {
    return this._price;
  }

  set price(value: number) {
    this._price = value;
  }

  get image(): string {
    return this._image;
  }

  set image(value: string) {
    this._image = value;
  }

  get quantity(): string {
    return this._quantity;
  }

  set quantity(value: string) {
    this._quantity = value;
  }

  get size() : string{
    return this._size;
  }

  set size( value : string){
    this._size= value ;
  } 
  // Chuyển DTO thành plain object (dễ gửi qua API)
  toPlain() {
    return {
      id: this._id,
      productName: this._productName,
      price: this._price,
      image: this._image,
      quantity: this._quantity,
      size : this._size
    };
  }
}
