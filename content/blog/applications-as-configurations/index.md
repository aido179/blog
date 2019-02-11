---
title: Applications as Configurations.
date: "2019-01-30T12:00:00.000Z"
---
Here’s a thought:

> “Most software applications consist of the same basic functions in different configurations”.

Let’s play with that. Imagine a super-high-level language that could describe a software application tersely, but still capture the usefulness of the application.

##✏️ Our app

**Example 1**
```yaml
App: Twitter
  Allow user to: login
  Allow user to: send a tweet
  Allow user to: follow another user
  Allow user to: view a timeline of tweets
```
[*further examples here*](https://gist.github.com/aido179/1734bb23182d801f4db3b3e694d54a63)

- Our app needs a name, we’ll use Twitter as an example.
- ```login``` is pretty self explanatory and so common that we can assume it’s baked into the language. ```login``` becomes ```library.login``` indicating we will use provided library behaviour and not a custom implementation.
- ```send a tweet``` is a unique instance of a very common action: take some user input (data: text, image, video, audio etc) and store it somewhere (write), so it can be returned (read) later. We can specify all that in more detail later. For now, let’s imagine ```send a tweet``` just references further configuration somewhere else, and becomes ```custom.tweet```
- ```follow another user``` again, a unique name for a common action: make a link, connection or relationship between two things, in this case, users of our app. In the case of twitter, the follower-to-followed relationship is **many-to-one**. The Facebook friend-to-friend relationship is **one-to-one**. On reddit, user-to-subreddit subscriptions are **one-to-many**. ```follow another user``` becomes ```custom.follow```
- ```view a timeline of tweets``` is a read action. It’s going to get some set of things, arrange them somehow and display them to the user. It will probably have nested actions, like liking, retweeting and replying but we’ll handle that later. It becomes ```custom.timeline```

Ok, let’s iterate.

**Example 2**
```yaml
App: Twitter
  Allow user to: library.login
  Allow user to: custom.tweet
  Allow user to: custom.follow
  Allow user to: custom.timeline
```

Each ```allow user to``` line corresponds to a function of the app, but may include multiple UI components. ```Library.login``` will obviously require a login page, a logout button somewhere else and other elements to update passwords and other information. ```custom.follow``` might appear in multiple places throughout the app.

##🌇 Structure and views

It probably makes sense then to define the structure of the app separately, but with reference to the previously defined actions.

**Example 3**
```yaml
App: Twitter
  Actions:
    #Allow the user do these...
    - library.login
    - custom.tweet
    - custom.follow
    - custom.timeline
  Views:
    # Allow the user to view these
    - library.landingPage
    - custom.home
    - custom.profile
```

Here I’ve split the app into ```Actions``` and ```Views```. We’ll consider the first view in the list (library.landingPage) to be the default or index. Again, using library means it’s built in. Allowing us to use default boilerplate like this should help speed up development. We can always come back later and use a custom view instead.

##🔗 Views and Actions

Mapping actions to parts of our application structure is not trivial. Some pages will have specific actions, and some actions will be reused in many views. Each view should define exactly the actions it needs.

**Example 4**
```yaml
App: Twitter
  Actions:
    #Allow the user do these...
    - library.login
    - custom.tweet
    - custom.follow
    - custom.timeline
  Views:
    # Allow the user to view these
    - library.landingPage
        - library.login
    - custom.home
        - library.login.isUserloggedIn
        - custom.tweet
        - custom.timeline
    - custom.profile
        - library.login.isUserloggedIn
        - custom.follow
```

Now views have specific actions. We can now have functionality, with the added bonus that is totally clear what happens in each view.

Notice how ```library.login``` is used in each view. The ```library.login``` action is like a package with many nested functions. We should be able to use specific parts of an action like this — where we don’t need to let the user login on each page, but only check that they are logged in.

##🗣️ Discussion
It is conceivable that a configuration like this could be used to generate all the necessary boilerplate for an application. At this point, the application could be generated for any platform too.

None of this is necessarily new. [Meteor](https://www.meteor.com/) provides default app generation, boilerplate login functionality, and client-server comms. [React](https://reactjs.org/) has [create-react-app](https://github.com/facebook/create-react-app) which…creates a React app for you. The [Vue CLI](https://cli.vuejs.org/guide/creating-a-project.html) create command will scaffold your app. In fact, tools like [Yeoman](https://yeoman.io/) literally allows you to define a ‘generator’ and spit out a scaffolded application. Further, [React Native](https://facebook.github.io/react-native/) takes a JavaScript project (basically a highly featured configuration) and generates native applications, similar to [Cordova](https://cordova.apache.org/).

Code generation is not new. So what’s different here?

In the case of Yeoman, *create-react-app* and the VUE *create* command, once the scaffolding is generated, it’s all up to you. You are left with standard application code and development continues as normal. What I propose here is a tight coupling where the **configuration becomes the application**, not just a blueprint. That is, if you change the configuration at any time, the code will be updated to reflect that change. Write code that conflicts with the configuration, you get errors.

**A developer should be able to look at the configuration and know that the application strictly conforms to that definition.**

In the case of Meteor, with it’s highly functional login boilerplate and client-server comms (pub/sub), (which I think is wonderful, by the way) this goes a step further. User authentication and login is not a convenient package that happens to work quite well — it should be baked in to the very core of the system. With Meteor, the developer still needs to write templates that show/hide content or routes based on the users logged in state. This is silly. At best, it is inconvenient and leads to template overhead. At worst, it is a security risk when, though accident or inexperience, a developer does not handle authentication correctly.

**It should be impossible to create insecure apps!**

When a view is defined like this:

```yaml
...
Views:
    - custom.home
        - library.login.isUserloggedIn
        ...
```

There should be nothing else to do. If the user isn’t properly authenticated, it isn’t accessible. That’s it. No fiddling with client side routers, entry events, or app-wide templates or anything else. The config is God. The config wins.

Finally, (for now) there are massive benefits when it comes to deployment and maintenance. Deterministic configurations should provide reliable deployments, and make dependency management easy. Imagine an app you built 5 years ago using library.login: you should be able to trust that a new deployment will include up-to-date authentication code — because your app will be generated using the standard configuration, it is always backwards compatible. Even if massive high level changes need to be made, as long as you use ```library.login.isUserloggedIn```, your view will be protected on a higher level by the generated app code.

##🎬 Conclusion
I know I am being incredibly idealistic here. I’m certain that there are edge cases and complications that make this completely impractical for some purposes. But this isn’t supposed to be a panacea. It’s supposed to work for the 90% of applications that need to make CRUD operations protected by user authentication.

But it’s fun to dream.
