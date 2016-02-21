import createRecognizer from '../../src/createRecognizer';
import { r, redirect } from '../../src/index';

describe('createRecognizer', function () {

  describe('recognize', function () {

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

    const recognize = createRecognizer(routes);

    it('returns null for undefined route', function () {
      const result = recognize('/undefined');

      expect(result).toBe(null);
    });

    it('returns correct state for /login route', function () {
      const result = recognize('/login');

      expect(result).toEqual({
        root: {
          login: {}
        },
        queryParams: {}
      });
    });

    it('returns correct state for /user/123 route', function () {
      const result = recognize('/user/123');

      expect(result).toEqual({
        root: {
          user: {
            id: '123',
            index: {}
          }
        },
        queryParams: {}
      });
    });

    it('returns correct state for /user/123/profile route', function () {
      const result = recognize('/user/123/profile');

      expect(result).toEqual({
        root: {
          user: {
            id: '123',
            profile: {}
          }
        },
        queryParams: {}
      });
    });

    it('handles queryParams for /user/123/profile?q=456&u=abc route', function () {
      const result = recognize('/user/123/profile?q=456&u=abc');

      expect(result).toEqual({
        root: {
          user: {
            id: '123',
            profile: {}
          }
        },
        queryParams: {
          q: '456',
          u: 'abc',
        }
      });
    });

    it('handles redirect for /sign-up route', function () {
      const result = recognize('/sign-up');

      expect(result).toEqual({
        root: {
          login: {}
        },
        redirectTo: '/login',
        redirectFrom: '/sign-up',
        queryParams: {}
      });
    });

    it('handles multiple redirects for / route', function () {
      const result = recognize('/');

      expect(result).toEqual({
        root: {
          login: {}
        },
        redirectTo: '/login',
        redirectFrom: '/',
        queryParams: {}
      });
    });

    it('handles star segments for /about/*path route', function () {
      const result = recognize('/about/company');

      expect(result).toEqual({
        root: {
          about: {
            path: 'company',
            index: {},
          }
        },
        queryParams: {}
      });
    });

    it('handles nested star segments for /about/*path/detail route', function () {
      const result = recognize('/about/company/detail');

      expect(result).toEqual({
        root: {
          about: {
            path: 'company',
            detail: {},
          }
        },
        queryParams: {}
      });
    });

  });

});
