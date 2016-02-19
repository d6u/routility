# Routility

A generic routing utility to convert URLs to objects, so your application logic can consume them without being limited by a specify API set.

**Before reaching 1.0, API and semantic will change between minor versions.**

## Usage

```js
var Routility = require('routility');
var r = Routility.r;
var redirect = Routility.redirect;

var routes = ( // Parentheses are not required, it looks nice to align all the routes
  r('/', 'root', [
    redirect('/', '/login'),
    r('/login', 'login'),
    r('/user/:id', 'user', [
      r('/', 'index'), // If you don't define "/", "/user/:id" won't be handled
      r('/profile', 'profile')
    ])
  ])
);

var navTo = Routility.start(routes, function (state) {
  // this handler will only be called when routing first start
  // and users use browser back and forward button to navigate
});

navTo('/user/123'); // Will first change url to "/user/123" and return new state
```

## API

### `r(path, name, subRoutes) -> RouteDefinition`

Define route hierarchy. (The `(` and `)` are not necessary, it just help align the `r` function calls, makes them nice to read.) `name` argument is related to the structure of `state` object.

```js
var routes = (
  r('/', 'root', [
    redirect('/', '/login'),
    r('/login', 'login'),
    r('/user/:id', 'user', [
      r('/', 'index'), // If you don't define "/", "/user/:id" won't be handled
      r('/profile', 'profile')
    ])
  ])
);
```

### `redirect(path, targetPath)`

`path` has the same semantic as `path` argument of `r` function. `targetPath` is an **absolute** url to the new path.

### `start(definition, handler, [opts]) -> navTo`

Start routing for browser. Return a `navTo` helper. `handler` will only be called when first start routing, then on every time user use browser back and forward button to navigate. Refer to [Structure of `state`](#Structure of `state`) section to learn what the `state` object will look like.

```js
var navTo = start(definition, function (state) {
  // You can notify the app state has changed here
});
```

#### options

- `opts.browserHistory = false` Use HTML5 history. If `false`, will use url hashtag. If `true`, will use the entire path.

### `navTo([path]) -> state|null`

Navigate to target URL. If called without arguments, will return current state. (Refer to [Structure of `state`](#Structure of `state`) section to learn what the `state` object will look like.) If hit a redirect route, it will go directly to the redirect target path, and only return the final `state` object. It will return `null` if `path` matches no route.

``` js
navTo(); // return current state, no effect on url
navTo('/');
navTo('/login');
navTo('/user/123');
navTo('/user/123/profile?q=abc');
```

### `parse(definition, path) -> state|null`

A helper to take a `definition` and a `path`, and generate the `state` object for that `path`. **This function has no effect on browser url**. It just return the `state` object, and that's it! This can be used to run on Node.js (server) environment. It will return the final `state` object if it the `path` hits a redirect route. It will return `null` if `path` matches no route (both when directly or after redirect).

### Structure of `state`

```js
// A example route definition
r('/', 'root', [
  r('/', 'index'),
  redirect('/sign-in', '/login'),
  r('/login', 'login'),
  r('/user/:id', 'user', [
    r('/', 'index'),
    r('/profile', 'profile')
  ])
]);

// For '/'
{
  "root": {
    "index": {}
  },
  "queryParams": {}
}

// For '/sign-in'
{
  "root": {
    "login": {} // Show login instead because it hits a redirect route
  },
  "queryParams": {}
}

// For '/login'
{
  "root": {
    "login": {}
  },
  "queryParams": {}
}

// For '/user/123'
{
  "root": {
    "user": {
      "id": "123" // Notice "id" will always be a string
    }
  },
  "queryParams": {}
}

// For '/user/123/profile?q=abc&name=one'
{
  "root": {
    "user": {
      "id": "123",
      "profile": {}
    }
  },
  "queryParams": {
    "q": "abc",
    "name": "one"
  }
}
```
