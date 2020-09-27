FROM node:slim

ENV TZ="Asia/Taipei"
ENV YOUBIKE_DATA_DIR="/var/lib/youbike-worker/data"

RUN apt-get update && apt-get install -y \
    vim \
    cron

RUN mkdir /var/lib/youbike-worker
RUN chmod 777 /var/lib/youbike-worker

RUN mkdir /var/lib/youbike-worker/data

RUN mkdir /var/log/youbike-worker
RUN chmod 777 /var/log/youbike-worker

WORKDIR /youbike-worker
COPY ./package.json ./
COPY ./run.sh ./
COPY ./worker-cron /etc/cron.d/worker-cron

RUN crontab /etc/cron.d/worker-cron

RUN npm install
COPY . .

ENTRYPOINT ["/youbike-worker/start.sh"]

# Build image and create/run container  locally:
# docker build -t youbike-worker .
# docker run --env-file .env youbike-worker

# To go into docker container:
# docker ps (get container_id)
# docker exec -it (container_id) bash