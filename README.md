# WonderQ - simple queuing system

## Description
WonderQ is a queuing system designed to work with a high volume of messages. You can:
- Enqueue one message
- Dequeue one or more messages
- Acknowledge one message

The content of the message can be dynamic, as long as it is not empty.\
When messages are dequeued, they remain in the system marked as pending messages.\
If the consumer fails to acknowledge a message after a configurable amount of time, the message will be reinserted in the queue.\
To acknowledge a message, you need to use its ID, obtained during its enqueuing or dequeuing.

## Installation
Inside the project folder, to install the project dependencies run the command:\
`npm install`

## Configuration
The project can be configured for each stage, through the **.env** files found in the directory: 
> src/config/

These configuration files will be loaded according to the value of **NODE_ENV** (development, test, production).\
If NODE_ENV is not set, then by default the program will use
> src/config/.env.development

Here you can set:
- **PORT** = port value (default 8080).
- **REINSERTION_TIMEOUT** = value (ms) that the queue will wait before reinserting a dequeued pending message.
- **REQUEST_TIMEOUT** = value (ms) that the service will wait before replying **408 Request Timeout** if there is no previous response.

## Run the service
To start the service run the command:\
`npm start`

## API documentation
Once the service is up, the full API documentation can be found in\
**http://localhost:8080/wonderq/api/api-docs/**

The main endpoints are:
| Action|Method|URL|Request body|
|-|-|-|-|
|Enqueue one message|**POST**|http://localhost:8080/wonderq/api/messages|{key1: value1, key2: value2, ..., keyN: valueN}|
|Dequeue one or more messages|**PUT**|http://localhost:8080/wonderq/api/messages|{amount: **(number of messages)**}|
|Acknowledge one message|**DELETE**|http://localhost:8080/wonderq/api/messages|{ messageId: **(ID obtained from en/dequeuing)**}|

## Timeout Error
The service can reply **408 Request Timeout** if there was no response after a configurable amount of time.


---

## Recommendations to make the system production ready
- Use a centralized logger system (like Graylog)
- Make it into a Docker container so the execution doesn't depend on the environment, helping its portability.
- Configure this container to automatically restart in the event of an unexpected process shutdown.
- Implement a user system with tokenization (jsonwebtoken), to prevent unwanted users from polling messages.
- Implement rate limiting, to improve security and prevent the server from overloading.
- Add code to asynchronously backup the messages on a database so they are not lost if the service is stopped (MongoDB), and add code to load this messages when the service starts.
- Use a resource monitor, defining a core set of metrics to follow. (like Dynatrace)
- Use Cloud Computing Services that provide container configuration, monitoring, high availability, resource scaling, security, and message backup in its own database (Amazon Web Services).
- Lock npm dependencies to make sure exactly the same code runs on every instance.
- Expand the heap memory size of node.js with --max-old-space-size.
- Set the environment variable NODE_ENV to ‘production’ to trigger a possible optimization in many npm packages.
- Limit the max amount of messages in the queue, and after reaching it start replying 503 Service Unavailable for each enqueue until the load goes down, so the server doesn't overload.
- Improve the code to be able to create a queue instance for each topic, so the load get distributed.
- Use https instead of http to ensure privacy.

## Potential issues in production and possible solutions
- Unexpected process shutdown: deploy WonderQ in a Docker container configured tu restart automatically in the event of a process shutdown. Or better yet, use AWS to automatically handle the instances. Use a database as backup so the messages are not lost.
- Monitor alarms in resources: as explained in the recommendations section, limit the request rate, limit the max amount of messages in the queue, distribute the load implementing one topic per instance, if AWS is being used temporarily reallocate resources to mitigate the problems.
- Site outages: use high availability cloud services, like AWS to boot up a new instance of the service in a new location if the current one went down.
