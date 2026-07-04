# Build the Backend using docker

# Every Docker image starts with a base image.
# Here, the base image is Node.js version 20 running on Alpine Linux.
FROM node:20-alpine

#Copy Backend Files
COPY ./Backend .

#to install node_modules in container
RUN npm install

#command to Start the Server
CMD ["node", "server.js"]