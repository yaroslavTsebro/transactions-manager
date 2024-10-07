# Test Plan for User Service and Transaction Service

### 1. Unit Tests for `UserService`
   
1. Write a test for `UserService` to verify that a new user is successfully registered and has an initial balance of 0.
2. Write a test for `UserService` to verify that attempting to register with an already existing email returns a `UserAlreadyExistsError`.
3. Write a test for `UserService` to verify that providing incorrect login data returns an `InvalidCredentialsError`.
4. Write a test for `UserService` to verify that a valid JWT token is returned upon successful login.
5. Write a test for the `addBalance` method in `UserService` to verify that the user's balance increases by the specified amount.
6. Write a test for the `transfer` method in `UserService` to verify that when transferring funds from one user to another, the sender's balance decreases, and the recipient's balance increases.
7. Write a test for the `transfer` method in `UserService` to verify that an `InsufficientFundsError` is returned when the sender does not have enough balance.

### 2. Integration Tests for Database Interaction

1. Write a test for `UserService` to verify that after calling the `register` method, the user is indeed added to the database.
2. Write a test for the `getProfile` method to verify that valid user data is returned from the database when a correct JWT token is provided.
3. Write a test for `TransactionService` to verify that a transaction is saved in the database with the correct status after being created.
4. Write a test for `TransactionService` to verify that the transaction status updates to `SUCCESS` after the transaction is completed successfully.

### 3. Component Tests for Microservices

1. Write a test for `UserService` to verify that a user can be registered via API and then retrieve their profile data through another API request.
2. Write a test for `TransactionService` to verify that after creating a transaction through the API, its status is initially set to `PENDING`.
3. Write a test for `TransactionService` to verify that in case of an error during a transfer via API, the transaction status updates to `FAILED`.
4. Write a test for error handling in `UserService` to verify that the API returns a `401 Unauthorized` error when no JWT token is provided.

### 4. Tests for Message Queue Interaction (RabbitMQ)

1. Write a test for `TransactionService` to verify that when a transaction is created, a message is sent to the queue for further processing.
2. Write a test for `PaymentConsumer` to verify that upon receiving a payment message from the queue, the method to process the payment is called.
3. Write a test for `DLQHandler` to verify that upon receiving a message from the dead-letter queue (`DLQ`), the transaction status is updated to `FAILED` in the database.

### 5. E2E Tests for Full Operation Cycles

1. Write an E2E test to verify that a new user can register, add balance, and transfer funds to another user.
2. Write an E2E test to verify that in the event of a payment error, the error message is sent to the dead-letter queue, and the transaction status is updated to `FAILED`.
3. Write an E2E test to verify that a user can register, perform a transaction, and then retrieve the transaction status via API.
"""