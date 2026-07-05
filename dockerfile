# stage 1 : Build the Frontend [dist folder]

#create an internal environment with Nodejs+OS
FROM node:20-alpine as frontend-builder
#copy all content of folder "Frontend" in app(inside environment)
COPY ./Frontend /app
#Now, all command will be executed for app folder
WORKDIR /app
#since we do not have node_modules in app ,so to get it , we run this-
RUN npm install

RUN npm run build

#Stage 2 : Build the Backend

#create another internal environment with Nodejs+OS
FROM node:20-alpine
COPY ./Backend /app
WORKDIR /app
RUN npm install

#stage 3 : Copy the dist folder content in Backend/public folder

#copy all content of app of frontend builder to public of app of backend
COPY --from=frontend-builder /app/dist /app/public
CMD ["node", "server.js"]