import { r, redirect, start, parse } from '../../src/index';

describe('r', function () {

  it('returns an object', function () {
    const result = r('/', 'index');

    expect(result).toEqual({
      path: '/',
      name: 'index',
      children: null,
    });
  });

});

describe('redirect', function () {

  it('returns an object', function () {
    const result = redirect('/', '/somewhere');

    expect(result).toEqual({
      path: '/',
      targetPath: '/somewhere',
    });
  });

});

describe('r & redirect', function () {

  it('returns an complex object', function () {
    const result = (
      r('/', 'root', [
        redirect('/', '/sign-up'),
        redirect('/sign-up', '/login'),
        r('/login', 'login'),
        r('/user/:id', 'user', [
          r('/', 'index'),
          r('/profile', 'profile')
        ]),
        r('/about/*path', 'about', [
          r('/', 'index'),
          r('/detail', 'detail')
        ]),
      ])
    );

    expect(result).toEqual({
      path: '/',
      name: 'root',
      children: [
        { path: '/', targetPath: '/sign-up' },
        { path: '/sign-up', targetPath: '/login' },
        { path: '/login', name: 'login', children: null },
        { path: '/user/:id', name: 'user', children: [
          { path: '/', name: 'index', children: null },
          { path: '/profile', name: 'profile', children: null },
        ]},
        { path: '/about/*path', name: 'about', children: [
          { path: '/', name: 'index', children: null },
          { path: '/detail', name: 'detail', children: null },
        ]},
      ],
    });
  });

});

describe('parse', function () {

  const routes = (
    r('/', 'root', [
      redirect('/', '/sign-up'),
      redirect('/sign-up', '/login'),
      r('/login', 'login'),
      r('/user/:id', 'user', [
        r('/', 'index'),
        r('/profile', 'profile')
      ]),
      r('/about/*path', 'about', [
        r('/', 'index'),
        r('/detail', 'detail')
      ]),
    ])
  );

  it('converts path to state', function () {
    const result = parse(routes, '/login');

    expect(result).toEqual({
      root: {
        login: {}
      },
      queryParams: {}
    });
  });

  it('can be curried', function () {
    const parser = parse(routes);

    expect(parser('/login')).toEqual({
      root: {
        login: {}
      },
      queryParams: {}
    });

    expect(parser('/user/123/profile')).toEqual({
      root: {
        user: {
          id: '123',
          profile: {}
        }
      },
      queryParams: {}
    });
  });

});

describe('start', function () {

  const routes = (
    r('/', 'root', [
      redirect('/', '/sign-up'),
      redirect('/sign-up', '/login'),
      r('/login', 'login'),
      r('/user/:id', 'user', [
        r('/', 'index'),
        r('/profile', 'profile')
      ]),
      r('/about/*path', 'about', [
        r('/', 'index'),
        r('/detail', 'detail')
      ]),
    ])
  );

  it('invokes handler with initial state', function (done) {
    start(r('/', 'root'), function (state) {
      try {
        expect(state).toEqual({
          root: {},
          queryParams: {}
        });
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('invokes handler with initial redirect state', function (done) {
    start(routes, function (state) {
      try {
        expect(state).toEqual({
          root: {
            login: {}
          },
          queryParams: {},
          redirectTo: '/login',
          redirectFrom: '/',
        });
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('invokes handler with new state when use navTo helper', function (done) {
    let skippedInitial = false;

    const navTo = start(routes, function (state) {
      if (!skippedInitial) {
        skippedInitial = true;
        return;
      }

      try {
        expect(state).toEqual({
          root: {
            user: {
              id: '123',
              index: {},
            }
          },
          queryParams: {},
        });
        done();
      } catch (err) {
        done(err);
      }
    });

    navTo('/user/123');
  });

  it('invokes handler with new state when navTo hit redirect route', function (done) {
    let skippedInitial = false;

    const navTo = start(routes, function (state) {
      if (!skippedInitial) {
        skippedInitial = true;
        return;
      }

      try {
        expect(state).toEqual({
          root: {
            login: {}
          },
          queryParams: {},
          redirectTo: '/login',
          redirectFrom: '/sign-up',
        });
        done();
      } catch (err) {
        done(err);
      }
    });

    navTo('/sign-up');
  });

  it('navTo returns new state when called with new path', function () {
    const navTo = start(routes, function (state) {});
    const result = navTo('/user/123');

    expect(result).toEqual({
      root: {
        user: {
          id: '123',
          index: {}
        }
      },
      queryParams: {},
    });
  });

  it('navTo returns new state when hit redirect route', function () {
    const navTo = start(routes, function (state) {});
    const result = navTo('/sign-up');

    expect(result).toEqual({
      root: {
        login: {}
      },
      queryParams: {},
      redirectTo: '/login',
      redirectFrom: '/sign-up',
    });
  });

  it('navTo to same path should not ', function () {
    let skippedInitial = false;
    const navTo = start(routes, function (state) {
      if (!skippedInitial) {
        skippedInitial = true;
        return;
      }
      throw new Error('should not invoke');
    });
    navTo('/login');
    navTo('/login');
  });

});
