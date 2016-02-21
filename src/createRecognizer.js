import RouteRecognizer from 'route-recognizer';

/**
 * Generate route description for route-recognizer
 *
 * @param {RouteDefinition|RedirectDefinition} definition
 *
 * @return {Object[][]} The base object should look like:
 *                      {
 *                        path: string;
 *                        handler: Object;
 *                      }
 */
function generateDescriptions(definition) {
  const path = definition.path;
  const name = definition.name;
  const children = definition.children;
  const targetPath = definition.targetPath;

  const current = [{
    path,
    handler: name ? { type: 'normal', name } : { type: 'redirect', targetPath }
  }];

  const results = [];

  if (!children || !children.length) {
    return [ current ];
  }

  for (const child of children) {
    const parts = generateDescriptions(child);
    for (const part of parts) {
      results.push(current.concat(part));
    }
  }

  return results;
}

/**
 * Take route segments returned from "routeRecognizer.recognize" and convert
 * them into a single object
 *
 * @param  {Object} parts Array like structure returned by
 *                        "routeRecognizer.recognize"
 *
 * @return {Object} Should look like:
 *                  {
 *                    "root": {
 *                      "user": {
 *                        "id": "123",
 *                        "profile": {}
 *                      }
 *                    },
 *                    "queryParams": {
 *                      "q": "abc"
 *                    }
 *                  }
 */
function buildState(parts) {

  const lastPartHandler = parts[parts.length - 1].handler;

  if (lastPartHandler.type === 'redirect') {
    return lastPartHandler.targetPath;
  }

  const obj = {};
  let cur = obj;

  // Cannot use for...of, because parts is not strictly an array
  for (let i = 0; i < parts.length; i++) {
    const { handler: { name }, params } = parts[i];
    cur[name] = { ...params };
    cur = cur[name];
  }

  obj.queryParams = parts.queryParams;

  return obj;
}

/**
 * Create route recognizer function
 *
 * @param {RouteDefinition} definition The RouteDefinition is simply an object
 *                                     with three properties:
 *                                     {
 *                                       path: string;
 *                                       name: string;
 *                                       children: Array<RouteDefinition|RedirectDefinition>;
 *                                     }
 *
 * @return {recognize} A recognize function that takes an url and
 *                     returns an object
 */
function createRecognizer(definition) {
  const router = new RouteRecognizer();
  const descriptions = generateDescriptions(definition);

  for (let i = 0; i < descriptions.length; i++) {
    router.add(descriptions[i]);
  }

  function recognize(url) {
    const parts = router.recognize(url);
    if (!parts) {
      return null;
    }

    const state = buildState(parts);

    if (typeof state !== 'string') {
      return state;
    }

    const redirectedState = recognize(state);

    // The order of redirectTo, redirectedState, and redirectFrom is important
    // When multiple redirect happends, we want to assign redirectTo with final url
    // but redirectFrom with starting url
    return { redirectTo: state, ...redirectedState, redirectFrom: url };
  }

  return recognize;
}

export {
  createRecognizer as default,
};
