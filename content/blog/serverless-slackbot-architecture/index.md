---
title: Serverless SlackBot Architecture
date: "2021-01-26"
description: "Slack Bots provide a great entry point to backend functionalities. For sporadic use cases, serverless architectures are easy to set up, easy to maintain, and generally cost less than traditional servers."
status: PUBLISHED
---
# Serverless SlackBot Architecture

## Motivation

**Slack Bots** provide a great entry point to backend functionalities. My team uses SlackBots to automate common tasks and to provide non-technical teammates with access to self-serve utilities. **Serverless architectures** are generally easier to set up, easier to maintain, and cost less than traditional servers for sporadic use cases. In short, serverless architecture is a great fit for the irregular usage of our Slack Bots.

My initial research into serverless-based Slack Bots did not yield a lot of examples. In fact, much of Slack's API documentation seems to assume that the developer is running a traditional server. Stubborn developer that I am, I insisted on a fully serverless implementation anyway. This article describes the architecture that we landed upon, its quirks and shortcomings. In a future article I hope to share more of the application code.

> In this article, the terms Slack Bot and Slack App are used interchangeably. Technically, [everything is a Slack App](https://api.slack.com/bot-users#:~:text=A%20bot%20is%20a%20type,a%20Slack%20App%20can%20do.). But "Bots" are chic and cool and hip, man, and I'm no jive turkey.
## Requirements

The solution must abide by the following requirements and constraints:
1. The architecture must 100% serverless managed resources (and in this case will be on AWS).
1. The architecture must support Slack slash commands.
1. The architecture must support Slack interactions.
1. The architecture should minimize usage of Slack's developer APIs.

> This author is of the opinion that the only thing less consistent and cohesive than Slack's developer APIs is the associated documentation. While SlackBots are great, the development experience is awful. One silver lining of this approach is improved isolation of the bot application code from the Slack interface; in other words, application functionality will not be limited to Slack!

## Step One: Slash Commands

Slack Slash Commands are the perfect first step to take if you are new to SlackBot. A slash command very much embodies a "Push button, get thing" simplicity that is easy to wrap you head around. As a super basic example, you may want `/random-number` to return to you a random number. When it comes to automating more complex workflows, you may want `/create-order --env=test --type=SHIP_TO_CONSUMER --items=2` to create an order resource, of type ship-to-consumer, in the test environment containing two random items.

In either case, required application does not run in Slack itself. The slash command essentially collects inputs and sends the data to a webhook.

The sequence diagram below describes an extensible architecture for ingesting Slack slash commands.

**Slash Command Architecture Overview**
![Ingest Command](https://www.websequencediagrams.com/files/render?link=FI3jamI7wMqnDperlGPIvmLY4yt8EjMfNO9hyssLtmln1h7UHhARdiv82O17AaDQ)

### Slack

Slack requires that you create a SlackBot from the [developer console](https://api.slack.com) and assign it necessary permissions. [Creation](ADDLINK) and [permissioning](ADDLINK) are outside the scope of this article, but I hope that the linked resources can help.

One SlackBot can accommodate many slash commands. From your Slack app's developer console, you are required to submit a `Request URL` for each registered slash command; Slack will POST the input payload to this URL whenever the slash command is run. To avoid superfluous infrastructure, use the same URL for every slash command and then use a controller to send the request to the appropriate worker.

### API Gateway

This architecture requires a single API Gateway to accept all slash command POSTs. These payloads are forwarded to the slash command controller lambda, whose job it is to redirect the workload to the correct worker.

> The dynamically generated raw API Gateway URL might change over time, if you destroy and recreate your CloudFormation stack. If it changed, then your slash command integration would also break until you made appropriate manual corrections in the Slack app developer console. It is advisable to front the API Gateway with a static URL via Route 53 in order to avoid this problem.

### Slash Command Controller Lambda

The main job of the slash command controller lambda is to redirect the command payload to the correct worker. For example, `/do-thing` commands should be redirected to the DoThing Worker Lambda and `/create-order` commands should be redirected to the CreateOrder Worker Lambda. As you can see, adding new functionality is as simple as (1) register new slack command with same old `Request URL`; (2) update controller lambda with new redirect; and (3) build out your new functionality in a new worker lambda.

However, Slack has some quirks that the controller lambda is also responsible for resolving. The main issue is the 3 second timeout; if the slash command does not receive _some_ response within 3 seconds, then the request times out and is treated as a failure.

Therefore, as described in the diagram above, the controller lambda should send an immediate `200` response as soon as basic validations take place and before the workload is forwarded. This can be accompanied by a basic message to inform the user to hang out while the workload is assigned and processed.

> Some example helpful messages:
> * _Okay! Working on it, boss..._
> * _Message received! Spinning up the hamster wheels..._
> * _Roger that. Too close of missiles, switching to guns._
>
> Really anything to let the user know how much you care.

It depends on your use case, but it is probably not necessary for the controller lambda to wait for worker lambda to finish its workload. The controller lambda's execution generally can end after it fowards the payload.

### Worker Lambda(s)

The content of the worker lambda is really up to you; this is where your feature logic lives. This lambda has two jobs: (1) do the work; and (2) send response to the user.

In theory, it need not be a single lambda, or even a lambda at all! Could be a Step Function or any number of async processes. It's main job to perform the requested work.

If you wanted to completely isolate the worker lambda from any Slack-ification (and that's not a terrible idea), you could have the controller lambda wait for the workload result and send the response back to Slack. This would have the extremely positive benefit of allowing the worker lambda to interface with main input channels, not just Slack! The downside is that you'll have a potentially long-lived controller lambda execution while it waits for the workload to finish. In short, your mileage may vary!

## Step Two: Add an Interaction

A Slack Interaction provides a friendly UX for Slack App user inputs. For example, you've trained your business users to use `/create-order` to create their own test data; now you want them to update the order state themselves (e.g. complete an order) instead of asking you to manually POST updates to the test environment. Slack Interactions to the rescue!

In this example, an order can be `COMPLETED` or `CANCELLED`; under the hood, your service simply patches an `order` resource to `status: 'COMPLETED'` or `status: 'CANCELLED'`. You want to provide these options to your business user with a simple button interface after an order is created.

**Interaction Architecture Overview**
![Ingest Command and Interaction](https://www.websequencediagrams.com/files/render?link=SnylH6eIgROqIuY8bUiUadG1IvOmYbPij1SyMGKwXzoMjbTVT81sOo4uHuzrn116)

As before, initiate the SlackBot with the slash command, `/create-order`. This time, however, the worker lambda is additionally responsible for [constructing an Interaction config](https://api.slack.com/messaging/interactivity) and sending it back to the channel whence it came. There are a number of interaction types and Slack provides [Block Kit Builder](https://api.slack.com/block-kit), a playground for designing them.

> Regardless of the Block Kit Builder, I've found the developer APIs for creating and interacting with Slack Interactions to be awful. I will summarize some pain points below. Your mileage may vary.

Next, after you send an interaction back to the initiating user, there must be some means by which your application can ingest the subsequent user input. Every Slack App can optionally configure an Interaction `Request URL`. From the Slack App dashboard, enable interactivity and configure the `Request URL` with your API Gateway. Slack will send an HTTP POST request with information to this URL when users interact with a shortcut or interactive component.

Per the infrastructure diagram, I use the same API Gateway to ingest requests for slash commands and interactions, but have configured different paths (`/commands` and `/interactions`, respectively) for each callback type.

Once interaction payloads are flowing into API Gateway, the setup is very much the same as for slash commands: a controller lambda provides initial checks and routes the interaction payload to the appropriate worker, and the worker lambda performs the work defined in the interaction payload. In our example...
1. the user clicks either the `COMPLETE` or `CANCEL` button,
1. this interaction payload is delivered via API Gateway to the interaction controller lambda,
1. the interaction controller lambda inspects the payload and routes it to the appropriate worker lambda (i.e. an Update Order Worker),
1. the worker lambda patches the order to `COMPLETED` or `CANCELLED`, then posts a success message back to Slack.

## Potential Improvements

1. Decouple controller and worker lambdas with SNS or SQS. The result would be that the worker lambda **must** take ownership of communicating results back to Slack.
1. Eliminate slash command controller lambda entirely by linking a more detailed API Gateway path (e.g. `/commands/create-order`) directly to the relevant worker lambda. Similar to decoupling, this setup forces the worker lambda to both send the synchronous response and communicate final results back to Slack.
1. Conversely, enforce that the controller lambdas are the sole interface with Slack so that worker lambdas can isolate their single responsibility. This would allow workers to interface with other triggers, not just Slack.

## Pain Points

Through this article I've alluded to some pain points that I found working with Slack developer APIs. Some of these may be due to my own ignorance.
1. **Manual set-up steps**. So far as I can tell, there is no way to avoid manually configuring slash command endpoints and an interactivity endpoint via the Slack App console. Which is to say, this infrastructure can never be fully automated (e.g. with Terraform) because you are forced into the console to configure these data points. _I would love to be wrong about this_.
1. **Capability inconsistencies**. A slack app can have any number of slash command URLs, but can only have one interaction URL. It is like they had the foresight to understand that developers would want to point different commands at different backends, but somehow missed the same logic for interaction inputs. _I would love to understand more about this._
1. **Interaction payloads**. Maybe the worst part of trying to implement interactivity is handling the interaction payloads. There are three interaction types: Messages, Home Tab, and Modals. Their payloads have different schema and their callbacks fire at different times. For example, let's say you want to collect a couple user inputs and then send a single payload -- you know, a classic form. Message Interactions support forms; every input fires the callback. Modals do support forms... so if you want to receive an aggregate user input payload (as you probably must in a serverless context), you are forced to use Modals. Modals, meanwhile, are implemented with an awkward API that does not even retain the channel id it came from (whereas it is always baked into a Message payload).
1. **Slack developer documentation is a hot mess**. For any given question you have about how to use Slack's developer APIs, there are probably three or seven official pages claiming to answer your question, they all cross-reference each other, and none of them really gets to the heart of your problem (I challenge you to look up how to build a Slack Interaction and come away with reasonable answer). There is no repository of curated infrastructure templates to help you set up on AWS, Azure, or wherever (and hence this article came to be). Most tellingly of all, [Slack's official documentation](https://api.slack.com/) is bifurcated from its [GitHub presence](https://github.com/slackapi/node-slack-sdk), and so it is that much harder to connect the dots when explanations do not add up (or open issues to rectify the documentation).

## Conclusion

Slack does not make it easy to build out any Apps, and less so on serverless infrastructure, but if you bang your head on it long enough you can build some really useful functionality. My team has dramatically decreased its hand-holding overhead by giving our business user teammates easy-to-use self-service tools. I hope to follow up the architecture described in this article with a sample implementation sometime soon!
