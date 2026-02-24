import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";


actor {
  type UserId = Principal;
  type PostId = Nat;
  type CommentId = Nat;
  type ConversationId = Nat;
  type MessageId = Nat;
  type Gender = { #male; #female; #other };
  type Orientation = { #top; #bottom; #versatile; #lesbian };
  type RelationshipStatus = { #looking; #casual; #fun };
  type Subscription = {
    #free;
    #pro;
  };

  type UserProfile = {
    id : UserId;
    username : Text;
    bio : Text;
    photo : ?Storage.ExternalBlob;
    gender : Gender;
    city : Text;
    state : Text;
    interests : [Orientation];
    lookingFor : [RelationshipStatus];
    subscription : Subscription;
    isAdmin : Bool;
    postCountDaily : Nat;
    messageCountDaily : Nat;
    lastActivityDay : Int;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.username, p2.username);
    };
  };

  type TextPost = {
    content : Text;
  };

  type PhotoPost = {
    photo : Storage.ExternalBlob;
    caption : Text;
  };

  type PostContent = {
    #text : TextPost;
    #photo : PhotoPost;
  };

  type Post = {
    id : PostId;
    author : UserId;
    content : PostContent;
    timestamp : Time.Time;
    likeCount : Nat;
    commentCount : Nat;
  };

  type PostComment = {
    id : CommentId;
    postId : PostId;
    author : UserId;
    content : Text;
    timestamp : Time.Time;
  };

  type Message = {
    id : MessageId;
    sender : UserId;
    content : Text;
    timestamp : Time.Time;
  };

  type Conversation = {
    id : ConversationId;
    participant1 : UserId;
    participant2 : UserId;
    messages : List.List<Message>;
  };

  type ConversationView = {
    id : ConversationId;
    participant1 : UserId;
    participant2 : UserId;
    messages : [Message];
  };

  type EmployeeView = {
    id : UserId;
    username : Text;
    city : Text;
    state : Text;
    photo : ?Storage.ExternalBlob;
  };

  // Storage
  var nextPostId = 1;
  var nextCommentId = 1;
  var nextConversationId = 1;
  var nextMessageId = 1;

  let userProfiles = Map.empty<UserId, UserProfile>();
  let posts = Map.empty<PostId, Post>();
  let follows = Map.empty<UserId, List.List<UserId>>();
  let conversations = Map.empty<ConversationId, Conversation>();
  let postLikes = Map.empty<PostId, Set.Set<UserId>>();
  let postComments = Map.empty<PostId, List.List<PostComment>>();
  let authorizedAdmins = Set.empty<UserId>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(userId : UserId) : async ?UserProfile {
    userProfiles.get(userId);
  };

  public query ({ caller }) func getFollowers(userId : UserId) : async [UserId] {
    switch (follows.get(userId)) {
      case (?followers) { followers.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let validatedProfile : UserProfile = {
      id = caller;
      username = profile.username;
      bio = profile.bio;
      photo = profile.photo;
      gender = profile.gender;
      city = profile.city;
      state = profile.state;
      interests = profile.interests;
      lookingFor = profile.lookingFor;
      subscription = profile.subscription;
      isAdmin = profile.isAdmin;
      postCountDaily = 0;
      messageCountDaily = 0;
      lastActivityDay = getCurrentDay();
    };

    userProfiles.add(caller, validatedProfile);
  };

  public shared ({ caller }) func createPost(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let today = getCurrentDay();
    let userProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User profile not found") };
    };
    let remainingPosts = switch (userProfile.lastActivityDay == today, userProfile.subscription) {
      case (true, #free) { 3 - userProfile.postCountDaily };
      case (true, #pro) { 10000 }; // Arbitrary large limit for pro
      case (_, _) { 3 };
    };
    if (remainingPosts <= 0) {
      Runtime.trap("Daily post limit reached");
    };

    let post : Post = {
      id = nextPostId;
      author = caller;
      content = #text { content };
      timestamp = Time.now();
      likeCount = 0;
      commentCount = 0;
    };
    posts.add(nextPostId, post);
    nextPostId += 1;

    let updatedProfile = {
      userProfile with
      postCountDaily = if (userProfile.lastActivityDay == today) {
        userProfile.postCountDaily + 1;
      } else { 1 };
      lastActivityDay = today;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func createPhotoPost(photo : Storage.ExternalBlob, caption : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only Pro users can create photo posts");
    };

    func hasProSubscription(caller : Principal) : Bool {
      switch (userProfiles.get(caller)) {
        case (?profile) {
          switch (profile.subscription) {
            case (#pro) { true };
            case (_) { false };
          };
        };
        case (null) { false };
      };
    };

    if (not hasProSubscription(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only Pro users or admins can create photo posts");
    };

    let today = getCurrentDay();
    let userProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User profile not found") };
    };
    let remainingPosts = switch (userProfile.lastActivityDay == today, userProfile.subscription) {
      case (true, #pro) { 10000 };
      case (true, #free) { 0 };
      case (_, _) { 0 };
    };
    if (remainingPosts <= 0) {
      Runtime.trap("Daily post limit reached");
    };

    let post : Post = {
      id = nextPostId;
      author = caller;
      content = #photo {
        photo;
        caption = switch (caption) {
          case (?c) { c };
          case (null) { "" };
        };
      };
      timestamp = Time.now();
      likeCount = 0;
      commentCount = 0;
    };
    posts.add(nextPostId, post);
    nextPostId += 1;

    let updatedProfile = {
      userProfile with
      postCountDaily = if (userProfile.lastActivityDay == today) {
        userProfile.postCountDaily + 1;
      } else { 1 };
      lastActivityDay = today;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func deletePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };
    switch (posts.get(postId)) {
      case (?post) {
        if (post.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own posts");
        };
        posts.remove(postId);
      };
      case (null) {
        Runtime.trap("Post not found");
      };
    };
  };

  public query ({ caller }) func getPost(postId : PostId) : async ?Post {
    posts.get(postId);
  };

  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    let likesSet = switch (postLikes.get(postId)) {
      case (?set) { set };
      case (null) { Set.empty<UserId>() };
    };
    if (likesSet.contains(caller)) {
      Runtime.trap("Already liked this post");
    };
    likesSet.add(caller);
    postLikes.add(postId, likesSet);

    switch (posts.get(postId)) {
      case (?post) {
        let updatedPost = { post with likeCount = post.likeCount + 1 };
        posts.add(postId, updatedPost);
      };
      case (null) {
        Runtime.trap("Post not found");
      };
    };
  };

  public query ({ caller }) func getPostsByUser(userId : UserId) : async [Post] {
    posts.values().toArray().filter(
      func(post) { post.author == userId }
    );
  };

  public query ({ caller }) func getFeed() : async [Post] {
    posts.values().toArray();
  };

  public shared ({ caller }) func commentPost(postId : PostId, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on posts");
    };

    let comment : PostComment = {
      id = nextCommentId;
      postId;
      author = caller;
      content;
      timestamp = Time.now();
    };

    let commentsList = switch (postComments.get(postId)) {
      case (?comments) { comments };
      case (null) { List.empty<PostComment>() };
    };

    commentsList.add(comment);
    postComments.add(postId, commentsList);
    nextCommentId += 1;

    switch (posts.get(postId)) {
      case (?post) {
        let updatedPost = { post with commentCount = post.commentCount + 1 };
        posts.add(postId, updatedPost);
      };
      case (null) {
        Runtime.trap("Post not found");
      };
    };
  };

  public query ({ caller }) func getPostComments(postId : PostId) : async [PostComment] {
    switch (postComments.get(postId)) {
      case (?comments) { comments.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func followUser(targetUser : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    if (caller == targetUser) {
      Runtime.trap("Cannot follow yourself");
    };

    let existingFollowers = switch (follows.get(targetUser)) {
      case (?followers) { followers };
      case (null) { List.empty<UserId>() };
    };

    if (existingFollowers.contains(caller)) {
      Runtime.trap("Already following this user");
    };

    existingFollowers.add(caller);
    follows.add(targetUser, existingFollowers);
  };

  public shared ({ caller }) func unfollowUser(targetUser : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };
    let existingFollowers = switch (follows.get(targetUser)) {
      case (?followers) { followers };
      case (null) { List.empty<UserId>() };
    };

    let filteredFollowers = existingFollowers.filter(func(id) { id != caller });
    follows.add(targetUser, filteredFollowers);
  };

  func getCurrentDay() : Int {
    Time.now() / (24 * 60 * 60 * 1_000_000_000);
  };

  public shared ({ caller }) func sendMessage(to : UserId, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let today = getCurrentDay();
    let userProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User profile not found") };
    };
    let remainingMessages = switch (userProfile.lastActivityDay == today, userProfile.subscription) {
      case (true, #free) { 10 - userProfile.messageCountDaily };
      case (true, #pro) { 10000 }; // Arbitrary large limit for pro
      case (_, _) { 10 };
    };
    if (remainingMessages <= 0) {
      Runtime.trap("Daily message limit reached");
    };

    let message : Message = {
      id = nextMessageId;
      sender = caller;
      content;
      timestamp = Time.now();
    };

    var conversationId : ConversationId = 0;

    conversations.entries().forEach(func((id, conv)) {
      if (
        (conv.participant1 == caller and conv.participant2 == to) or
        (conv.participant1 == to and conv.participant2 == caller)
      ) {
        conversationId := id;
      };
    });

    if (conversationId == 0) {
      conversationId := nextConversationId;
      let newConversation : Conversation = {
        id = conversationId;
        participant1 = caller;
        participant2 = to;
        messages = List.empty<Message>();
      };
      conversations.add(conversationId, newConversation);
      nextConversationId += 1;
    };

    switch (conversations.get(conversationId)) {
      case (?conversation) {
        conversation.messages.add(message);
      };
      case (null) {};
    };

    nextMessageId += 1;

    let updatedProfile = {
      userProfile with
      messageCountDaily = if (userProfile.lastActivityDay == today) {
        userProfile.messageCountDaily + 1;
      } else { 1 };
      lastActivityDay = today;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getConversation(partner : UserId) : async ?[Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    var foundConv : ?Conversation = null;
    conversations.values().forEach(
      func(conv) {
        if (conv.participant1 == caller and conv.participant2 == partner or conv.participant1 == partner and conv.participant2 == caller) {
          foundConv := ?conv;
        };
      }
    );
    switch (foundConv) {
      case (?conv) { ?conv.messages.toArray() };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllConversations() : async [ConversationView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    conversations.values().toArray().filter(
      func(conv) {
        conv.participant1 == caller or conv.participant2 == caller
      }
    ).map(
      func(conv) {
        {
          id = conv.id;
          participant1 = conv.participant1;
          participant2 = conv.participant2;
          messages = conv.messages.toArray();
        };
      }
    );
  };

  public shared ({ caller }) func uploadPhoto(photo : Storage.ExternalBlob, b : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload photos");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile : UserProfile = {
          id = caller;
          username = profile.username;
          bio = profile.bio;
          photo = ?photo;
          gender = profile.gender;
          city = profile.city;
          state = profile.state;
          interests = profile.interests;
          lookingFor = profile.lookingFor;
          subscription = profile.subscription;
          isAdmin = profile.isAdmin;
          postCountDaily = profile.postCountDaily;
          messageCountDaily = profile.messageCountDaily;
          lastActivityDay = profile.lastActivityDay;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // Admin & Employee Management

  public shared ({ caller }) func addAdmin(newAdmin : UserId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add new admins");
    };

    authorizedAdmins.add(newAdmin);
  };

  public query ({ caller }) func getEmployees() : async [EmployeeView] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view employees");
    };

    userProfiles.values().toArray().filter(
      func(profile) { profile.isAdmin }
    ).map(
      func(profile) {
        {
          id = profile.id;
          username = profile.username;
          city = profile.city;
          state = profile.state;
          photo = profile.photo;
        };
      }
    );
  };
};
