import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Users
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Posts, Stories, Reels
  include MixinStorage();

  public type UserProfile = {
    username : Text;
    displayName : Text;
    bio : Text;
    profilePicture : Storage.ExternalBlob;
    followerCount : Nat;
    followingCount : Nat;
  };

  public type Message = {
    sender : Principal;
    recipient : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  public type Story = {
    id : Text;
    author : Principal;
    content : Storage.ExternalBlob;
    timestamp : Time.Time;
    expiresAt : Time.Time;
  };

  public type Reel = {
    id : Text;
    author : Principal;
    video : Storage.ExternalBlob;
    caption : Text;
    timestamp : Time.Time;
  };

  module Story {
    public func compare(s1 : Story, s2 : Story) : Order.Order {
      compareByTimestamp(s1, s2);
    };

    func compareByTimestamp(s1 : Story, s2 : Story) : Order.Order {
      if (s1.timestamp > s2.timestamp) {
        return #less;
      };
      if (s1.timestamp < s2.timestamp) {
        return #greater;
      };
      #equal;
    };
  };

  let profiles = Map.empty<Principal, UserProfile>();
  let followers = Map.empty<Principal, [Principal]>();
  let stories = Map.empty<Text, Story>();
  let reels = Map.empty<Text, Reel>();
  let messages = Map.empty<Text, Message>();

  module Reel {
    func compareByTimestamp(r1 : Reel, r2 : Reel) : Order.Order {
      if (r1.timestamp > r2.timestamp) {
        return #less;
      };
      if (r1.timestamp < r2.timestamp) {
        return #greater;
      };
      #equal;
    };
  };

  // Helper function to check if user1 follows user2
  func isFollowing(user1 : Principal, user2 : Principal) : Bool {
    switch (followers.get(user2)) {
      case (null) { false };
      case (?list) {
        list.find(func(p : Principal) : Bool { p == user1 }) != null;
      };
    };
  };

  // Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin access required");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  // Follow System
  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view followers");
    };
    switch (followers.get(user)) {
      case (null) { [] };
      case (?list) { list };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view following");
    };
    switch (followers.get(user)) {
      case (null) { [] };
      case (?list) { list };
    };
  };

  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    if (caller == target) {
      Runtime.trap("Cannot follow yourself");
    };
    let currentFollowers = switch (followers.get(target)) {
      case (null) { [] };
      case (?array) { array };
    };
    if (currentFollowers.find(func(p : Principal) : Bool { p == caller }) != null) {
      Runtime.trap("Already following");
    };
    let newFollowers = currentFollowers.concat([caller]);
    followers.add(target, newFollowers);
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };
    let currentFollowers = switch (followers.get(target)) {
      case (null) { [] };
      case (?array) { array };
    };
    let filtered = currentFollowers.filter(func(p : Principal) : Bool { p != caller });
    followers.add(target, filtered);
  };

  // Messaging & Chat System
  public shared ({ caller }) func sendMessage(recipient : Principal, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (caller == recipient) {
      Runtime.trap("Cannot send message to yourself");
    };
    let message : Message = {
      sender = caller;
      recipient;
      text;
      timestamp = Time.now();
    };
    let messageId = caller.toText() # "_" # recipient.toText() # "_" # Time.now().toText();
    messages.add(messageId, message);
  };

  public query ({ caller }) func getMessages(otherUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    let allMessages = messages.values().toArray();
    let filtered = allMessages.filter(func(m : Message) : Bool {
      (m.sender == caller and m.recipient == otherUser) or (m.sender == otherUser and m.recipient == caller)
    });
    filtered;
  };

  // Stories Feature
  public shared ({ caller }) func addStory(content : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add stories");
    };
    let story : Story = {
      id = Time.now().toText();
      author = caller;
      content;
      timestamp = Time.now();
      expiresAt = Time.now() + (3600 * 24 * 1_000_000_000);
    };
    stories.add(story.id, story);
  };

  public query ({ caller }) func getAllStories() : async [Story] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };
    let now = Time.now();
    let allStories = stories.values().toArray();
    let validStories = allStories.filter(func(s : Story) : Bool {
      s.expiresAt > now and (s.author == caller or isFollowing(caller, s.author) or AccessControl.isAdmin(accessControlState, caller))
    });
    validStories.sort();
  };

  public shared ({ caller }) func deleteStory(storyId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete stories");
    };
    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?story) {
        if (story.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own stories");
        };
        stories.remove(storyId);
        return ();
      };
    };
  };

  // Reels Feature
  public shared ({ caller }) func addReel(video : Storage.ExternalBlob, caption : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reels");
    };
    let reel : Reel = {
      id = Time.now().toText();
      author = caller;
      video;
      caption;
      timestamp = Time.now();
    };
    reels.add(reel.id, reel);
  };

  public query ({ caller }) func getAllReels() : async [Reel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reels");
    };
    reels.values().toArray();
  };

  public shared ({ caller }) func deleteReel(reelId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete reels");
    };
    switch (reels.get(reelId)) {
      case (null) { Runtime.trap("Reel not found") };
      case (?reel) {
        if (reel.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own reels");
        };
        reels.remove(reelId);
        return ();
      };
    };
  };
};
