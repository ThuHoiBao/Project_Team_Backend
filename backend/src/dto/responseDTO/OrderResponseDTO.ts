// dto/responseDTO/OrderResponseDTO.ts

import { OrderItemResponseDTO } from './OrderItemResponseDTO';

export class OrderResponseDTO {
  private _id: string = '';
  private _orderStatus: string = '';
  private _totalPrice: number = 0;
  private _nameUser: string = '';
  private _address: string = '';
  private _paymentMethod: string = '';
  private _amount: number = 0;
  private _discount: number = 0;
  private _orderDate!: Date;
  private _phoneNumber: string = '';
  private _orderItems: OrderItemResponseDTO[] = [];

  // Getter and Setter methods
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }
  get orderStatus(): string {
    return this._orderStatus;
  }
  set orderStatus(value: string) {
    this._orderStatus = value;
  }
  get totalPrice(): number {
    return this._totalPrice;
  }
  set totalPrice(value: number) {
    this._totalPrice = value;
  }
  get nameUser(): string {
    return this._nameUser;
  }
  set nameUser(value: string) {
    this._nameUser = value;
  }
  get address(): string {
    return this._address;
  }
  set address(value: string) {
    this._address = value;
  }
  get paymentMethod(): string {
    return this._paymentMethod;
  }
  set paymentMethod(value: string) {
    this._paymentMethod = value;
  }
  get discount(): number {
    return this._discount;
  }
  set discount(value: number) {
    this._discount = value;
  }
  get orderDate(): Date {
    return this._orderDate;
  }
  set orderDate(value: Date) {
    this._orderDate = value;
  }
  get phoneNumber(): string {
    return this._phoneNumber;
  }
  set phoneNumber(value: string) {
    this._phoneNumber = value;
  }
  get amount(): number {
    return this._amount;
  }
  set amount(value: number) {
    this._amount = value;
  }
  get orderItems(): OrderItemResponseDTO[] {
    return this._orderItems;
  }
  set orderItems(value: OrderItemResponseDTO[]) {
    this._orderItems = value;
  }

  // Chuyển DTO thành plain object
  toPlain() {
    return {
      id: this._id,
      orderStatus: this._orderStatus,
      totalPrice: this._totalPrice,
      nameUser: this._nameUser,
      address: this._address,
      paymentMethod: this._paymentMethod,
      discount: this._discount,
      orderDate: this._orderDate,
      phoneNumber: this._phoneNumber,
      amount: this._amount,
      orderItems: this._orderItems.map((item) => item.toPlain()),
    };
  }
}