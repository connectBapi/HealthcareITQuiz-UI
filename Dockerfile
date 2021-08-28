# This defines our starting point
FROM node:10

RUN mkdir /usr/src/app 

WORKDIR /usr/src/app

RUN npm install -g @angular/cli@7

COPY . . 