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

A Slack Interaction provides a friendly UX for Slack App user inputs. For example, you've trained your business users to use `/create-order` to create their own test data; now you want them to update the order themselves instead of asking you to POST updates to the test environment. Interactions to the rescue!

In this example, an order can be `COMPLETED` or `CANCELLED`; under the hood, your service simply patches an `order` resource to `status: 'COMPLETED'` or `status: 'CANCELLED'`. You want to provide these options to your business user as simple buttons after an order is created.

**Interaction Architecture Overview**
[Ingest Command and Interaction](https://www.websequencediagrams.com/files/render?link=SnylH6eIgROqIuY8bUiUadG1IvOmYbPij1SyMGKwXzoMjbTVT81sOo4uHuzrn116)

As before, initiate the SlackBot with the slash command, `/create-order`. This time, however, the worker lambda is additionally responsible for [constructing an Interaction config](https://api.slack.com/messaging/interactivity) and sending it back to the channel whence it came. There are a number of interaction types and Slack provides [Block Kit Builder](https://api.slack.com/block-kit), a playground for designing them.

> Regardless of the Block Kit Builder, I've found the developer APIs for creating and interacting with Slack Interactions to be awful. I will summarize some pain points below. Your mileage may vary.

Provided that you are able to send an interaction back to the initiating user, you must have some means by which to ingest the subsequent user input. 