FROM node:slim

RUN apt-get update && apt-get install -y \
    vim \
    cron

RUN mkdir /var/lib/youbike
RUN chmod 777 /var/lib/youbike

RUN mkdir /var/lib/youbike/data

RUN mkdir /var/logs/youbike
RUN chmod 777 /var/logs/youbike

WORKDIR /youbike
COPY ./package.json ./
COPY ./run.sh ./
COPY ./worker-cron /etc/cron.d/worker-cron

RUN crontab /etc/cron.d/worker-cron

RUN npm install
COPY . .

ENTRYPOINT ["cron", "-f"]