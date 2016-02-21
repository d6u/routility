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
