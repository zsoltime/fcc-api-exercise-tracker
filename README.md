# API Project: freeCodeCamp Exercise Tracker [![Build Status](https://img.shields.io/travis/zsoltime/fcc-api-exercise-tracker.svg?style=flat-square)](https://travis-ci.org/zsoltime/fcc-api-exercise-tracker)

This is my entry for [freeCodeCamp's fourth "APIs & Microservices" project][fcc-link]. Demo is available on [my site][demo]. You can also check out [my other freeCodeCamp projects][projects].

## User Stories

It was kind of challenging to find the user stories for this project, and all I could find is a [forum link][user-stories]. I'm not sure if these are the actual user stories, but will go with these this time. 😅

- [x] I can create a user by posting form data `username` to `/api/exercise/new-user` and returned will be an object with `username` and `_id`.
- [x] I can get an array of all users by getting `api/exercise/users` with the same info as when creating a user.
- [x] I can add an exercise to any user by posting form data `userId(_id)`, `description`, `duration`, and optionally `date` to `/api/exercise/add`. If no date supplied it will use current date. Returned will be the user object with the exercise fields added.
- [x] I can retrieve a full exercise log of any user by getting `/api/exercise/log` with a parameter of `userId(_id)`. Return will be the user object with added array `log` and `count` (total exercise count).
- [x] I can retrieve part of the log of any user by also passing along optional parameters of `from` & `to` or `limit`. (Date format `yyyy-mm-dd`, limit = `int`)

## Example Usage

In the following example we create a new user, add a new activity for her and fetch all her activities.

```javascript
fetch('/api/exercise/new-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ username: 'Sara' }),
})
  .then(res => res.json())
  .then(user =>
    fetch('/api/exercise/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        description: 'runnning',
        duration: 45,
        userId: user._id,
      }),
    })
  )
  .then(res => res.json())
  .then(({ user }) => fetch(`/api/exercise/log/?userId=${user}`))
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
```

### Example Output

```json
{
  "_id": "5b896ce5de10b36f64307ebb",
  "username": "Sara",
  "count": 1,
  "log": [
    {
      "_id": "5b896ce5de10b36f64307ebc",
      "date": "2018-08-31T16:29:25.093Z",
      "description": "runnning",
      "duration": 45
    }
  ]
}
```

## API Endpoints

| Method | Route                  | Description                              |
| :----: | :--------------------- | :--------------------------------------- |
|  GET   | /api/exercise/users    | Get an array of all users                |
|  GET   | /api/exercise/log      | Retrieve a full exercise log of any user |
|  POST  | /api/exercise/add      | Add an exercise to any user              |
|  POST  | /api/exercise/new-user | Create a new user                        |

## Tools Used

- [ESLint](https://github.com/eslint/eslint) linter with Airbnb's [base config](https://www.npmjs.com/package/eslint-config-airbnb-base)
- [Express.js](https://github.com/expressjs/express) framework
- [Jest](https://github.com/facebook/jest) test framework
- [Pug](https://github.com/pugjs/pug) template engine
- [Supertest](https://github.com/visionmedia/supertest/) library

## Install and Build

#### Clone this repo

```bash
git clone https://github.com/zsoltime/fcc-api-exercise-tracker.git
cd fcc-api-exercise-tracker
```

#### Install dependencies

```bash
npm install
```

#### Start dev server

It starts a dev server, monitor for changes and restarts on any change.

```bash
npm run dev
```

#### Start

It starts the node.js application.

```bash
npm start
```

#### Run tests

It runs tests using Jest and Supertest.

```bash
npm test
```

[demo]: https://zsolti.me/apis/exercise-tracker
[fcc-link]: https://learn.freecodecamp.org/apis-and-microservices/apis-and-microservices-projects/exercise-tracker
[projects]: https://github.com/zsoltime/freeCodeCamp
[user-stories]: https://forum.freecodecamp.org/t/exercise-tracker-project-with-testable-user-stories-guinea-pigs-needed/73232
