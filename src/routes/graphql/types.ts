import { GraphQLObjectType, GraphQLNonNull, GraphQLID, GraphQLString, GraphQLList, GraphQLInt } from 'graphql';

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLString) },
    country: { type: new GraphQLNonNull(GraphQLInt) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    discount: { type: new GraphQLNonNull(GraphQLInt) },
    monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) }
  }
});

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    subscribedToUserIds: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(obj, _, context) {
        return await context.db.posts.findMany({ key: 'userId', equals: obj.id});
      }
    },
    profile: {
      type: ProfileType,
      async resolve(obj, _, context) {
        return await context.db.profiles.findOne({ key: 'userId', equals: obj.id});
      }
    },
    memberType: {
      type: MemberTypeType,
      async resolve(obj, _, context) {
        const profile = await context.db.profiles.findOne({ key: 'userId', equals: obj.id });
        if (!profile) {
          return null;
        }
        return await context.db.memberTypes.findOne({ key: 'id', equals: profile.memberTypeId });
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      async resolve(obj, _, context) {
        return await context.db.users.findMany({ key: 'subscribedToUserIds', inArray: obj.id });
      }
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      async resolve(obj, _, context) {
        return await context.db.users.findMany({ key: 'id', equalsAnyOf: obj.subscribedToUserIds });
      }
    },
  })
});
