import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return await fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({ key: 'id', equals: request.params.id });
      if (!user) {
        throw fastify.httpErrors.notFound(`User doesn't exist`);
      }
      return user;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return await fastify.db.users.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const userProfile = await fastify.db.profiles.findOne({ key: 'userId', equals: request.params.id });
        if (userProfile) {
          await fastify.db.profiles.delete(userProfile.id);
        }

        const userPosts = await fastify.db.posts.findMany({ key: 'userId', equals: request.params.id });
        if (userPosts.length) {
          userPosts.forEach(async (userPost) => {
            await fastify.db.posts.delete(userPost.id);
          });
        }

        const userFollowers = await fastify.db.users.findMany({ key: 'subscribedToUserIds', inArray: request.params.id });
        if (userFollowers.length) {
          userFollowers.forEach(async (follower) => {
            const followerFollowing = follower.subscribedToUserIds;
            followerFollowing.splice(followerFollowing.indexOf(request.params.id), 1);
            await fastify.db.users.change(follower.id, { subscribedToUserIds: followerFollowing });
          });
        }

        return await fastify.db.users.delete(request.params.id);
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userToSubscribeTo = await fastify.db.users.findOne({ key: 'id', equals: request.body.userId });
      if (!userToSubscribeTo) {
        throw fastify.httpErrors.notFound(`User to subscribe doesn't exist`);
      }
      if (userToSubscribeTo.subscribedToUserIds.includes(request.params.id)) {
        return userToSubscribeTo;
      }
      return await fastify.db.users.change(request.body.userId, { subscribedToUserIds: [...userToSubscribeTo.subscribedToUserIds, request.params.id] });
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const userToUnsubscribeFrom = await fastify.db.users.findOne({ key: 'id', equals: request.body.userId });
        if (!userToUnsubscribeFrom) {
          throw fastify.httpErrors.notFound(`User to unsubscribe doesn't exist`);
        }
        if (!userToUnsubscribeFrom.subscribedToUserIds.includes(request.params.id)) {
          throw fastify.httpErrors.badRequest(`User is not subscribed`);
        }
        const following = userToUnsubscribeFrom.subscribedToUserIds;
        following.splice(following.indexOf(request.params.id), 1);
        return await fastify.db.users.change(request.body.userId, { subscribedToUserIds: following });
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        return await fastify.db.users.change(request.params.id, request.body);
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
