import RouteRecognizer from 'route-recognizer';
import { createHashHistory } from 'history';

export function defineRoute(path, name, children = null) {
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

function buildObj(parts) {
  const obj = {};

  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const { handler: name, params } = parts[i];
    cur[name] = {...params};
    cur = cur[name];
  }

  return obj;
}

export function start(def) {
  const router = new RouteRecognizer();

  for (const desc of generateDescriptions(def)) {
    router.add(desc);
  }

  const history = createHashHistory();

  history.listen(({pathname, search, action}) => {
    if (action !== 'PUSH') {
      return;
    }
    const parts = router.recognize(pathname + search);
    console.log(JSON.stringify({...buildObj(parts), queryParams: parts.queryParams}, null, 4));
  });

  return function (path) {
    history.push(path);
  };
}
