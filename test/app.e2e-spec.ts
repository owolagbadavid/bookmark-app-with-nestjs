import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from 'src/bookmark/dto';

describe('app e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3000);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(
      'http://localhost:3000',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth', () => {
    const dto: AuthDto = {
      email: 'foo@bar.com',
      password: 'secret',
    };

    describe('signup', () => {
      it('should throw an exception if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto.email)
          .expectStatus(400);
      });

      it('should throw an exception if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto.password)
          .expectStatus(400);
      });

      it('should throw an exception if no body', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });

      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('signin', () => {
      it('should throw an exception if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto.email)
          .expectStatus(400);
      });

      it('should throw an exception if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto.password)
          .expectStatus(400);
      });

      it('should throw an exception if no body', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });

      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('user', () => {
    describe('getMe', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders(
            'Authorization',
            'Bearer $S{userAt}',
          )
          .expectStatus(200);
      });
    });

    describe('editUser', () => {
      const dto: EditUserDto = {
        firstName: 'John',
        email: 'john@example.com',
      };
      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withBody(dto)
          .withHeaders(
            'Authorization',
            'Bearer $S{userAt}',
          )
          .expectStatus(200);
      });
      // });
    });
  });
  describe('bookmarks', () => {
    describe('getEmptyBookmark', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders(
            'Authorization',
            'Bearer $S{userAt}',
          )
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('createBookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Bookmark',
        description: 'Bookmark description',
        link: 'http://bookmark',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(dto)
          .withHeaders(
            'Authorization',
            'Bearer $S{userAt}',
          )
          .stores('bookmarkId', 'id')
          .expectStatus(201);
      });
    });

    describe('getBookmarks ', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders(
            'Authorization',
            'Bearer $S{userAt}',
          )
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('getSingleBookmark', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders(
            'Authorization',
            'Bearer $S{userAt}',
          )
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('editBookmark', () => {
      const dto: EditBookmarkDto = {
        title: 'edited bookmark',
        description: 'edited',
      };
      it('should update bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .withHeaders(
            'Authorization',
            'Bearer $S{userAt}',
          )
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    // describe('deleteBookmark', () => {
    //   it('should delete bookmark', () => {
    //     return pactum
    //       .spec()
    //       .delete('/bookmarks/{id}')
    //       .withPathParams('id', '$S{bookmarkId}')
    //       .withHeaders(
    //         'Authorization',
    //         'Bearer $S{userAt}',
    //       )
    //       .expectStatus(204);
    //   });
    // });

    describe('getEmptyBookmark', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders(
            'Authorization',
            'Bearer $S{userAt}',
          )
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
