# Taipei City Youbike API 
This is a backend NodeJS/Express server serving up various APIs to access the Youbike data of Taipei, Taiwan.

## Motivation
This project was to help me learn how to create an API backend using NodeJS/Express and MongoDB and adding tests. The data comes from Taiwan's Open Data API. 

## Tech/Framework Used
* Node.js
* Express.js
* MongoDB (local instance)

## Usage

This API server is meant to be used by a FE application (Postman can be used to test it out) and has the following endpoints:

|Endpoint|Method|Params|Response|
|:---|:---|:---|:---|
|/stations|GET|none|returns all youbike stations in Taipei|
|/stations/list|GET|page, size|returns a paginated (page # **page** with **size** results)|
|/stations/search|GET|q, loc|searches for stations with text of "**q**" (english or chinese) and are close by **loc** |
|/stations/nearby|GET|loc|returns a list of highest ranked youbike stations closest to **loc**|

## (Possible) Features
- API Authorization (developer portal/API to apply for developer token/secret; attach it to header)
- Web UI Front-End (simple FE app with google map)

- Add a worker to pull in data from Youbike and update MongoDB
- Docker-ize
- Add to CI/CD pipeline