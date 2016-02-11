import RouteRecognizer from 'route-recognizer';
import { createHashHistory, createHistory } from 'history';

/**
 * Define route
 *
 * @param {string}            path       Path of current route. This is always relative to parent.
 *                                       E.g. if "/user" is defined as a child of "/home", it will
 *                                       recongnize url of "/home/user"
 * @param {string}            name       Name of current route
 * @param {RouteDefinition[]} [children] Child route
 *
 * @return {RouteDefinition} The RouteDefinition is simply an object with three properties:
 *                           {
 *                           	 path: string;
 *                           	 name: string;
 *                           	 children: RouteDefinition[];
 *                           }
 */
function r(path, name, children = null) {
  return {path, name, children};
}

function generateDescriptions({path, name, children}) {
  const current = [{ path, handler: name }];
  const results = [];

  if (!children) {
    return [ current ];
  }

  for (const child of children) {
    for (const desc of generateDescriptions(child)) {
      results.push(current.concat(desc));
    }
  }

  return results;
}

function buildState(parts) {
  const obj = {};

  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const { handler: name, params } = parts[i];
    cur[name] = {...params};
    cur = cur[name];
  }

  return obj;
}

function start(def, { browserHistory = false } = {}) {
  const router = new RouteRecognizer();

  for (const desc of generateDescriptions(def)) {
    router.add(desc);
  }

  function getCurrentState(pathname, search) {
    const parts = router.recognize(pathname + search);
    return {...buildState(parts), queryParams: parts.queryParams};
  }

  const history = (browserHistory ? createHistory : createHashHistory)();

  let currentState = getCurrentState(
    browserHistory ? location.pathname : location.hash.slice(1),
    location.search);

  history.listen(({pathname, search, action}) => {
    if (action !== 'PUSH') {
      return;
    }
    currentState = getCurrentState(pathname, search);
  });

  return function (path) {
    if (path == null) {
      return currentState;
    }
    history.push(path);
    // Route change is sync,
    // so we can return new state within the same run loop
    return currentState;
  };
}

export {
  r,
  start,
};
