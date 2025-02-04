```markdown
# Express Backend with MongoDB and JWT Authentication

This is a basic Express backend application that uses MongoDB for data storage and JWT (JSON Web Tokens) for authentication. It also allows streaming of MP3 files placed in the root directory.

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (either locally or a cloud-based instance like MongoDB Atlas)

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sepolly/express-backend-for-streaming-songs.git
   cd express-backend-for-streaming-songs
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file:**

   Create a `.env` file in the root directory of the project and add the following environment variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000  # Optional: Specify a port (default is 3000)
   ```

   Replace `your_mongodb_connection_string` with your MongoDB connection URI and `your_jwt_secret_key` with a secure secret key for JWT.

4. **Add MP3 files:**

   Place your MP3 files in the root directory of the project. These files will be accessible via the streaming API.

## Running the Application

Start the server by running:

```bash
npm start
```

The server will start on the specified port (default is `3000`).

## API Endpoints

### Authentication

- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Log in and receive a JWT token.

### Streaming MP3 Files

- **GET /songs/:filename**: Stream an MP3 file.

  Example: If you have a file named `song1.mp3` in the root directory, you can stream it by visiting:

  ```
  http://localhost:3000/api/songs/song1.mp3
  ```

## Example Usage

1. Register a new user:

   ```bash
   curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name": "simeon","email": "simeon123@gmail.com" "password": "password123"}'
   ```

2. Log in to get a JWT token:

   ```bash
   curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"email": "simeon123@gmail.com", "password": "password123"}'
   ```

3. Stream an MP3 file:

   Open your browser or use a tool like `curl` to stream an MP3 file:

   ```
   http://localhost:3000/api/songs/song1.mp3
   ```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
``` 
