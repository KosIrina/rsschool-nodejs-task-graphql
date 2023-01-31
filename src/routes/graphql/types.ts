import { GraphQLObjectType, GraphQLNonNull, GraphQLID, GraphQLString, GraphQLList, GraphQLInt, GraphQLInputObjectType } from 'graphql';

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
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

export const CreateUserType = new GraphQLInputObjectType({
  name: 'CreateUser',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export const CreateProfileType = new GraphQLInputObjectType({
  name: 'CreateProfile',
  fields: {
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export const CreatePostType = new GraphQLInputObjectType({
  name: 'CreatePost',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export const UpdateUserType = new GraphQLInputObjectType({
  name: 'UpdateUser',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString }
  }
});

export const UpdateProfileType = new GraphQLInputObjectType({
  name: 'UpdateProfile',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
  }
});

export const UpdatePostType = new GraphQLInputObjectType({
  name: 'UpdatePost',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    content: { type: GraphQLString }
  }
});

export const UpdateMemberTypeType = new GraphQLInputObjectType({
  name: 'UpdateMemberType',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt }
  }
});

export const SubscribeToType = new GraphQLInputObjectType({
  name: 'SubscribeTo',
  fields: {
    currentUserId: { type: new GraphQLNonNull(GraphQLID) },
    userToSubscribeToId: { type: new GraphQLNonNull(GraphQLID) }
  }
});

export const UnsubscribeFromType = new GraphQLInputObjectType({
  name: 'UnsubscribeFrom',
  fields: {
    currentUserId: { type: new GraphQLNonNull(GraphQLID) },
    userToUnsubscribeFromId: { type: new GraphQLNonNull(GraphQLID) }
  }
});
