import { registerUserService, verifyOtpService } from "../src/service/authService";
import * as userRepository from "../src/repository/userRepository";
import { Coin } from "../src/models/Coin";
import Notification from "../src/models/Notification";
import bcrypt from "bcryptjs";

const MOCK_OTP = "123456";

// Mock dependencies
jest.mock("../src/repository/userRepository");
jest.mock("../src/models/Coin");
jest.mock("../src/models/Notification");
jest.mock("../src/utils/mailUtils", () => jest.fn().mockResolvedValue(undefined));
jest.mock("bcryptjs");
jest.mock("otp-generator", () => ({ generate: jest.fn().mockReturnValue(MOCK_OTP) }));

describe("verifyOtpService - welcome notification", () => {
  const email = "test@example.com";
  const userData = {
    email,
    password: "password123",
    firstName: "Test",
    lastName: "User",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a welcome notification after successful OTP verification", async () => {
    const mockUser = { _id: "user123", email };

    (userRepository.isEmailExist as jest.Mock).mockResolvedValue(false);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
    (Coin.create as jest.Mock).mockResolvedValue({});
    (Notification.create as jest.Mock).mockResolvedValue({});

    // Seed the OTP into otpStorage
    await registerUserService(userData as any);

    // Now verify with the known OTP
    const result = await verifyOtpService({ ...userData, otp: MOCK_OTP } as any);

    expect(result.message).toContain("OTP verified successfully");
    expect(Notification.create).toHaveBeenCalledTimes(1);
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser._id,
        title: "Chào mừng đến với cửa hàng!",
        message: expect.stringContaining("Test"),
        type: "info",
        isRead: false,
      })
    );
  });

  it("should not create a welcome notification when OTP is invalid", async () => {
    (userRepository.isEmailExist as jest.Mock).mockResolvedValue(false);
    (Notification.create as jest.Mock).mockResolvedValue({});

    // Seed OTP first
    await registerUserService(userData as any);

    // Verify with wrong OTP - should throw Invalid OTP
    await expect(
      verifyOtpService({ ...userData, otp: "wrong-otp" } as any)
    ).rejects.toThrow("Invalid OTP");

    expect(Notification.create).not.toHaveBeenCalled();
  });
});
