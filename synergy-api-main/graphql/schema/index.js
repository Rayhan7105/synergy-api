const {buildSchema} = require("graphql");
module.exports = buildSchema(`
    type Event {
        _id: ID!
        category: Category!
        title: String!
        description: String!
        date: String!
        time: String!
        venueType: String!
        imageUrl: String
        place: String
        placeId: String
        placeAddress: String
        placeLat: Float
        placeLng: Float
        eventType: String!
        limitGroupSize: String!
        groupSize: String
        tags: [String]
        skillLevel: String!
        host: User
        isDeleted: Boolean
        participants: [User]
        createdAt: String!
        updatedAt: String!
        deletedAt: String
        isFavorited: Boolean
    }
    type User {
      _id: ID!
      password: String!
      type: String!
      fname: String!
      sname: String!
      email: String!
      mobile: String
      profileImg: String
      desc: String
      hostingEvent: [Event!]
      favoritedEvents: [Event]
      joinedEvent:[Event]
      blockedUser: [String]
      notification: [PushNotification]
      notificationSetting: NotificationSetting!
      appleIdentityToken: String
      lastActiveAt: String
      pushToken: String
      createdAt: String
      updatedAt: String
      deletedAt: String
      bannedAt: String
    }
    type AuthData {
        userId: ID!
        userType: String
        token: String!
        tokenExpiration: Int!
    }
    type UserCountData {
        totalUserCount: Int
        newUserCountDay: Int
        newUserCountWeek: Int
        newUserCountMonth: Int
        activeUserCountDay: Int
        activeUserCountWeek: Int
        activeUserCountMonth: Int
    }
    type EventStatData {
        popularTagsAllTime: [String]
        popularTagsAllTimeCount: [Int]
        popularTagsThisMonth: [String]
        popularTagsThisMonthCount: [Int]
        popularTagsThisWeek: [String]
        popularTagsThisWeekCount: [Int]
        newEventsToday: Int
        newEventsThisWeek: Int
        newEventsThisMonth: Int
    }
    type Booking {
        _id: ID!
        event: Event!
        user: User!
        createdAt: String!
        updatedAt: String!
    }
    type Policy {
        _id: ID!
        appPolicy: String!
    }
    type Category{
        _id: ID!
        name: String!
        iconType: String!
        iconName: String!
        numberOfEvents: Int
    }
    type Report {
        _id: ID!
        reportedUser: User!
        offenderUser: User!
        reasonDetails: String!
        reasonCategory: String!
        status: String!
        createdAt: String
        updatedAt: String
    }
    type Message{
        _id: ID!
        msg: String!
        sender: User!
        receiver: User!
        createdAt: String!
        updatedAt: String!
    }
    type ChatRoom {
        _id: ID!
        members: [User!]!
        msg: [Message]
        createdAt: String!
        updatedAt: String!
    }
    type PushNotification {
        _id: ID!
        to: [String]!
        title: String
        body: String
        createdAt: String
        updatedAt: String
    }
    type NotificationSetting {
        _id: ID!
        allNotifications: Boolean
        AdminNotification: Boolean
        joinLeaveNotification: Boolean
        chatMessageNotification: Boolean
        createdAt: String
        updatedAt: String
    }
    input EventInput {
        id: String
        categoryId: String!
        title: String!
        description: String!
        date: String!
        time: String!
        venueType: String!
        place: String
        placeId: String
        placeAddress: String
        placeLat: Float
        placeLng: Float
        eventType: String!
        limitGroupSize: String!
        groupSize: String
        tags: [String]
        skillLevel: String!
        imageUrl: String
    }
    input UserInput {
      fname: String!
      sname: String!
      email: String!
      password: String
      mobile: String
      type: String
      profileImg: String
      desc: String
      userId: String
      appleIdentityToken: String
    }
    input CategoryInput{
        name: String!
        iconType: String!
        iconName: String!
        numberOfEvents: Int
        categoryId: String
    }
    input ReportInput {
        reportedUser: String
        offenderUser: String
        reasonDetails: String!
        reasonCategory: String!
        status: String
    }
    input PushNotificationInput {
        title: String!
        body: String!
        scheduledTime: String!
    }
    input NotificationSettingInput {
        _id: ID!
        allNotifications : Boolean!
        AdminNotification: Boolean!
        joinLeaveNotification: Boolean!
        chatMessageNotification: Boolean!
    }
    type RootQuery {
        events: [Event!]!
        eventsWithDeletedAt: [Event!]!
        eventStatsAndPopularTags: EventStatData
        users: [User!]!
        bookings: [Booking!]!
        categories: [Category]
        login(email: String!, password: String!): AuthData!
        eventById(eventId: String!): Event!
        userById(userId: String!): User!
        getEventsById(userId: String!): User!
        getFavoritedEventsById(userId: String!): User!
        policy: Policy!
        reports: [Report]
        userCounts: UserCountData
        isPasswordAuthenticated(userId: String!, oldPassword: String!): Boolean!
        checkUserExists(userEmail: String!): Boolean!
        chatRooms(userId: String!): [ChatRoom]!
        getHostingEventById(userId: String!): [Event]!
        getAllMessages(chatId: String!): ChatRoom!
        getLastMessage(chatId: String!): Message!
        getPushNotification:[PushNotification]!
        getUserNotifications(userId: String!): User!
        getNotificationSetting(userId: String!): User!
        getAllBlockedUser(userId: String!): User!
    }
    type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
        updateUser(userInput: UserInput): User
        banUser(email: String!): User
        deleteUser(userId: ID!): User
        favouriteOrUnfavouriteEvent(eventId: String!, userId: String!): Boolean
        bookEvent(eventId: ID!, userId:ID!): Booking!
        cancelBooking(eventId: ID!, userId:ID!): Event!
        cancelBookingForDeleteAccountOnly(eventId: ID!, userId:ID!): Event!
        cancelBookingForDeleteEventOnly(eventId: ID!, userId:ID!): Event!
        deleteEvent(eventId: ID!): Event
        updateEvent(eventInput: EventInput): Event!
        softDeleteEvent(eventId: String!): Event!
        login(email: String!, password: String!): AuthData!
        adminLogin(email: String!, password: String!): AuthData!
        createPolicy(appPolicy: String!): Policy
        updatePolicy(appPolicy: String!): Policy
        createCategory(categoryInput: CategoryInput): Category
        deleteCategory(categoryId: ID!): Category
        updateCategory(categoryInput: CategoryInput): Category
        getMostFrequentCategory(range: String!):[Category]
        createReport(reportInput: ReportInput): Report
        updateReport(reportId: String!, reportInput: ReportInput!): Report
        banReport(reportId: String!, status: String): Report
        resolveReport(reportId: String!, status: String): Report
        deleteReport(reportId: String!): Report
        createChatRoom(userId1: String!, userId2: String!): ChatRoom
        storePushToken(userId: String!, pushToken: String!): User!
        removePushToken(userId: String!):User!
        createPushNotification(eventParticipants: [String]!, to: [String]!, title: String!, body: String!): PushNotification
        createPushNotificationFromAdmin(to: String!, title: String!, body: String!): PushNotification!
        updateNotificationSettings(notificationSettingInput: NotificationSettingInput!): NotificationSetting!
        blockUser(myId: String!, userIdToBlock: String!): User!
        unblockUser(myId: String!, userIdToUnblock: String!): User!
        userByAppleIdentityToken(appleIdentityToken: String!): User!
        getDetailsByBlockedUserId(userIds: [String]!): [User]!
    }
    schema{
        query: RootQuery
        mutation: RootMutation
    }
    `);
