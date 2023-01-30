import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql';
import { graphqlBodySchema } from './schema';
import { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLID } from 'graphql';
import { UserType, ProfileType, PostType, MemberTypeType, CreateUserType, CreateProfileType, CreatePostType } from './types';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const AppQueryRootType = new GraphQLObjectType({
        name: 'Queries',
        fields: {
          users: {
            type: new GraphQLList(UserType),
            async resolve() {
              return await fastify.db.users.findMany();
            }
          },
          profiles: {
            type: new GraphQLList(ProfileType),
            async resolve() {
              return await fastify.db.profiles.findMany();
            }
          },
          posts: {
            type: new GraphQLList(PostType),
            async resolve() {
              return await fastify.db.posts.findMany();
            }
          },
          memberTypes: {
            type: new GraphQLList(MemberTypeType),
            async resolve() {
              return await fastify.db.memberTypes.findMany();
            }
          },
          user: {
            type: UserType,
            args: {
              id: {
                type: new GraphQLNonNull(GraphQLID),
              },
            },
            async resolve(_, args) {
              const user = await fastify.db.users.findOne({ key: 'id', equals: args.id });
              if (!user) {
                throw fastify.httpErrors.notFound(`User doesn't exist`);
              }
              return user;
            }
          },
          profile: {
            type: ProfileType,
            args: {
              id: {
                type: new GraphQLNonNull(GraphQLID),
              },
            },
            async resolve(_, args) {
              const profile = await fastify.db.profiles.findOne({ key: 'id', equals: args.id });
              if (!profile) {
                throw fastify.httpErrors.notFound(`Profile doesn't exist`);
              }
              return profile;
            }
          },
          post: {
            type: PostType,
            args: {
              id: {
                type: new GraphQLNonNull(GraphQLID),
              },
            },
            async resolve(_, args) {
              const post = await fastify.db.posts.findOne({ key: 'id', equals: args.id });
              if (!post) {
                throw fastify.httpErrors.notFound(`Post doesn't exist`);
              }
              return post;
            }
          },
          memberType: {
            type: MemberTypeType,
            args: {
              id: {
                type: new GraphQLNonNull(GraphQLID),
              },
            },
            async resolve(_, args) {
              const currentMemberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: args.id });
              if (!currentMemberType) {
                throw fastify.httpErrors.notFound(`Such member type doesn't exist`);
              }
              return currentMemberType;
            }
          },
        }
      });

      const AppMutationRootType = new GraphQLObjectType({
        name: 'Mutations',
        fields: {
          createUser: {
            type: UserType,
            args: {
              body: {
                type: new GraphQLNonNull(CreateUserType),
              },
            },
            async resolve(_, args) {
              return await fastify.db.users.create(args.body);
            }
          },
          createProfile: {
            type: ProfileType,
            args: {
              body: {
                type: new GraphQLNonNull(CreateProfileType),
              },
            },
            async resolve(_, args) {
              const user = await fastify.db.users.findOne({ key: 'id', equals: args.body.userId });
              if (!user) {
                throw fastify.httpErrors.badRequest('No such user exists');
              }
              const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: args.body.userId });
              if (profile) {
                throw fastify.httpErrors.badRequest('Profile already exists');
              }
              const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: args.body.memberTypeId });
              if (!memberType) {
                throw fastify.httpErrors.badRequest('Incorrect member type');
              }
              return await fastify.db.profiles.create(args.body);
            }
          },
          createPost: {
            type: PostType,
            args: {
              body: {
                type: new GraphQLNonNull(CreatePostType),
              },
            },
            async resolve(_, args) {
              const user = await fastify.db.users.findOne({ key: 'id', equals: args.body.userId });
              if (!user) {
                throw fastify.httpErrors.badRequest('No such user exists');
              }
              return await fastify.db.posts.create(args.body);
            }
          },
        }
      });

      const AppSchema = new GraphQLSchema({
        query: AppQueryRootType,
        mutation: AppMutationRootType
      });

      return await graphql({
        schema: AppSchema,
        source: String(request.body.query),
        variableValues: request.body.variables,
        contextValue: fastify,
      });
    }
  );
};

export default plugin;
