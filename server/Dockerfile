FROM node:slim

ENV TZ="Asia/Taipei"

RUN apt-get update && apt-get install -y \
    vim 

# RUN mkdir /var/lib/youbike-server
# RUN chmod 777 /var/lib/youbike-server

# RUN mkdir /var/logs/youbike-server
# RUN chmod 777 /var/logs/youbike-server

WORKDIR /youbike-server
COPY ./package.json ./

RUN npm install
COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]

# Build image and create/run container locally:
# docker build -t youbike-server .
# docker run --env-file .env -p 5000:5000 youbike-server

# To go into docker container:
# docker ps (get container_id)
# docker exec -it (container_id) bash