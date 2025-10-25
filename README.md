
# Project Team Backend


## Technology Stack

- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** mongoose
- **Authentication:** Google Auth
- **Cloud:** Google Cloud
- **Real-time Communication:** Socket.io

## File Tree: Project_Team_Backend

```
└── 📁 backend
    ├── 📁 src
    │   ├── 📁 config
    │   │   ├── ⚙️ config.json
    │   │   ├── 📄 configdb.ts
    │   │   ├── 📄 elasticClient.js
    │   │   ├── ⚙️ ggcloud.json
    │   │   └── 📄 viewEngine.ts
    │   ├── 📁 controller
    │   │   ├── 📄 authController.ts
    │   │   ├── 📄 cartController.ts
    │   │   ├── 📄 categoryController.ts
    │   │   ├── 📄 coinController.ts
    │   │   ├── 📄 feedbackController.ts
    │   │   ├── 📄 imageFeedbackController.ts
    │   │   ├── 📄 myAccountController.ts
    │   │   ├── 📄 notificationController.ts
    │   │   ├── 📄 orderController.ts
    │   │   ├── 📄 productController.ts
    │   │   ├── 📄 searchController.ts
    │   │   ├── 📄 uploadImageController.ts
    │   │   └── 📄 userController.ts
    │   ├── 📁 dto
    │   │   ├── 📁 requestDTO
    │   │   │   └── 📄 registerUserRequestDTO.ts
    │   │   └── 📁 responseDTO
    │   │       ├── 📄 FeedbackResponseDTO.ts
    │   │       ├── 📄 OrderItemResponseDTO.ts
    │   │       ├── 📄 OrderResponseDTO.ts
    │   │       └── 📄 userResponseDTO.ts
    │   ├── 📁 middleware
    │   │   └── 📄 authenticateToken.ts
    │   ├── 📁 models
    │   │   ├── 📄 AddressDelivery.ts
    │   │   ├── 📄 Cart.ts
    │   │   ├── 📄 CartItem.ts
    │   │   ├── 📄 Category.ts
    │   │   ├── 📄 Coin.ts
    │   │   ├── 📄 CoinUsage.ts
    │   │   ├── 📄 Coupon.ts
    │   │   ├── 📄 Feedback.ts
    │   │   ├── 📄 ImageFeedback.ts
    │   │   ├── 📄 ImageProduct.ts
    │   │   ├── 📄 Notification.ts
    │   │   ├── 📄 Order.ts
    │   │   ├── 📄 OrderItem.ts
    │   │   ├── 📄 Payment.ts
    │   │   ├── 📄 Product.ts
    │   │   ├── 📄 ProductSize.ts
    │   │   ├── 📄 UserFavorite.ts
    │   │   ├── 📄 index.ts
    │   │   ├── 📄 invalidatedToken.ts
    │   │   └── 📄 user.ts
    │   ├── 📁 public
    │   ├── 📁 repository
    │   │   ├── 📄 feedbackRepository.ts
    │   │   ├── 📄 orderRepository.ts
    │   │   └── 📄 userRepository.ts
    │   ├── 📁 route
    │   │   ├── 📄 authRoutes.ts
    │   │   ├── 📄 cartRoutes.ts
    │   │   ├── 📄 categoryRoutes.ts
    │   │   ├── 📄 coinRoutes.ts
    │   │   ├── 📄 feedbackRoute.ts
    │   │   ├── 📄 feedbackRoutes.ts
    │   │   ├── 📄 imageFeedbackRoutes.ts
    │   │   ├── 📄 notificationRoutes.ts
    │   │   ├── 📄 orderRoutes.ts
    │   │   ├── 📄 productRoutes.ts
    │   │   ├── 📄 protectedRoute.ts
    │   │   ├── 📄 uploadImageRoute.ts
    │   │   └── 📄 userRoutes.ts
    │   ├── 📁 seeders
    │   │   ├── 📄 addressDelivery.seeder.ts
    │   │   ├── 📄 category.seeder.ts
    │   │   ├── 📄 coin.ts
    │   │   ├── 📄 coinUsage.ts
    │   │   ├── 📄 coupon.ts
    │   │   ├── 📄 data.seed.ts
    │   │   ├── 📄 feedback.seeder.ts
    │   │   ├── 📄 feedbackImage.seeder.ts
    │   │   ├── 📄 order.seeder.ts
    │   │   ├── 📄 orderItemSeeder.ts
    │   │   ├── 📄 product.seed.ts
    │   │   ├── 📄 product.seeder.ts
    │   │   ├── 📄 productImage.seeder.ts
    │   │   ├── 📄 productSize.seeder.ts
    │   │   ├── 📄 seedSpecificOrder.ts
    │   │   └── 📄 updateOrdersWithCoupons.ts
    │   ├── 📁 service
    │   │   ├── 📄 authGoogleService.ts
    │   │   ├── 📄 authService.ts
    │   │   ├── 📄 cartService.ts
    │   │   ├── 📄 categoryService.ts
    │   │   ├── 📄 coinService.ts
    │   │   ├── 📄 feedbackService.ts
    │   │   ├── 📄 filterProductService.ts
    │   │   ├── 📄 imageFeedbackService.ts
    │   │   ├── 📄 myAccountService.ts
    │   │   ├── 📄 orderService.ts
    │   │   ├── 📄 productService.ts
    │   │   ├── 📄 searchService.ts
    │   │   ├── 📄 uploadImageService.ts
    │   │   └── 📄 userService.ts
    │   ├── 📁 types
    │   │   ├── 📁 express
    │   │   │   └── 📄 index.d.ts
    │   │   └── 📄 ServiceResponse.ts
    │   ├── 📁 utils
    │   │   ├── 📄 mailUtils.ts
    │   │   ├── 📄 socketClient.js
    │   │   └── 📄 textUtils.ts
    │   ├── 📁 views
    │   │   └── 📁 users
    │   │       └── 📄 uploadImage.ejs
    │   ├── 📄 server.ts
    │   └── 📄 socket.ts
    ├── 📁 tests
    │   └── 📄 product.test.ts
    ├── ⚙️ .env.example
    ├── ⚙️ .gitignore
    ├── ⚙️ .sequelizerc
    ├── 📄 jest.config.js
    ├── ⚙️ package-lock.json
    ├── ⚙️ package.json
    └── ⚙️ tsconfig.json
```

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone 
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file from the `.env.example` template.

4. Run the development server:
   ```bash
   cd backend -> npm run dev
   ```

---


