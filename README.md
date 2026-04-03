# Designer v11

This is a Node.js application that uses MongoDB for data storage.

## Prerequisites

- Docker
- Docker Compose

## Setup and Run

1. Ensure you have Docker and Docker Compose installed.

2. Clone or download the project.

3. Navigate to the project directory.

4. Run the following command to build and start the services:

   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the Node.js application image
   - Start MongoDB
   - Start the application on port 80

5. Access the application at `http://localhost:80`

## Stopping the Application

To stop the services, run:

```bash
docker-compose down
```

## Troubleshooting

- If MongoDB fails to start, ensure port 27017 is not in use.
- Check the logs with `docker-compose logs` for any errors.
- The uploads folder is mounted as a volume to persist uploaded files.