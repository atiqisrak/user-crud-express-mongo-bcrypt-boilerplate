# User CRUD Boilerplate with Express.js, bcrypt, and MongoDB

This project is a boilerplate for creating a User CRUD (Create, Read, Update, Delete) application using Express.js, bcrypt for password hashing, and MongoDB for the database. It provides a basic setup to get you started with user authentication and management.

# Author

Atiq Israk Niloy

## Features

- Create, Read, Update, and Delete (CRUD) operations for users
- Password hashing with bcrypt
- MongoDB integration
- Environment variable configuration
- Basic project structure for scalability

## Prerequisites

- Node.js
- MongoDB

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/user-crud-boilerplate.git
   cd user-crud-boilerplate
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:

   ```plaintext
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/user_crud
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

- **Create User**

  - **POST** `/api/users`
  - Request body: `{ "username": "string", "email": "string", "password": "string" }`

- **Get All Users**

  - **GET** `/api/users`

- **Get User by ID**

  - **GET** `/api/users/:id`

- **Update User**

  - **PUT** `/api/users/:id`
  - Request body: `{ "username": "string", "email": "string", "password": "string" }`

- **Delete User**
  - **DELETE** `/api/users/:id`

## Project Structure

```plaintext
user-crud-boilerplate/
├── config/
├── controllers/
│   └── userController.js
├── models/
│   └── User.js
├── routes/
│   └── userRoutes.js
├── .env
├── package.json
└── server.js
```

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.

Feel free to replace the placeholder URLs and any specific information as needed for your project.

# Contact

[LinkedIn](https://www.linkedin.com/in/atiq-israk/)
