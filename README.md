# Work in process

# Routility

A generic routing utility to convert URLs to objects, so your application logic can consume them without be tied to a specify API.

## Install

```sh
npm install routility
```

```js
var Routility = require('routility');
```

## API

### `r(path, name, subRoute) -> RouteDefinition`

Define route hierarchy.

```js
var definition = r('/', 'root', [
  r('/', 'root'),
  r('/home', 'home'),
  r('/user/:id', 'user', [
    r('/', 'index'), // If you don't define "/", "/user/:id" won't be handled
    r('/profile', 'profile')
  ])
]);
```

### `start(definition, [opts]) -> navTo`

Start routing for browser. Return a `navTo` helper.

```js
var navTo = start(definition);
```

#### options

- `opts.browserHistory = false` Use HTML5 history. If `false`, will use hashtag history.

### `navTo([path]) -> state`

Navigate to target URL. If called without arguments, will return current state.

```js
navTo(); // return current state
navTo('/');
navTo('/home');
navTo('/user/123');
navTo('/user/123/profile');
navTo('/user/123/profile?q=abc');
```

### Structure of `state`

```js
// For '/user/123/profile?q=abc'
{
    "root": {
        "user": {
            "id": "123",
            "profile": {}
        }
    },
    "queryParams": {
        "q": "abc"
    }
}
```
