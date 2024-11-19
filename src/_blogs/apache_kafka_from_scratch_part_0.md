Apache Kafka is a distributed event store and stream-processing platform often used for high-performance data pipelines. In this blog, we'll explore how Kafka brokers communicate with clients using the TCP protocol, and learn how various requests are handled.

![Apache Kafka Architecture](/assets/cluster.png "Apache Kafka Architecture with brokers and clients")

## Kafka broker
Before we dive into technical specifics, let’s understand what a Kafka broker is.

A Kafka broker is an essential component of Kafka, functioning as a server that processes requests, stores, and delivers data records, commonly referred to as messages or events. Each broker is responsible for managing its storage and processing layers but also works collaboratively as part of a cluster, ensuring fault tolerance and high availability.

Brokers distribute the topic partitions across the cluster, which helps to balance the load and provide redundancy. When producers send messages to a Kafka topic, the broker handles the task of appending the messages to the correct partitions in a fault-tolerant log. Consumers, which are the clients, can then subscribe to these topics to read the messages at their own pace. Kafka brokers are designed to handle thousands of concurrent connections efficiently, making them ideal for scalable and resilient data streaming applications.

## Setting Up a Basic Kafka Broker Using JavaScript

```javascript
import net from "net";

const server = net.createServer((connection) => {}

server.listen(9092, "127.0.0.1");
```

## Kafka wire protocol
Kafka brokers communicate with clients via the [Kafka wire protocol](https://kafka.apache.org/protocol.html), which employs a request-response model. In this model, the client sends a request message, and the broker responds with a message.

## Common Request and Response Structure
All requests and responses in Kafka include a `message_size` field:

```
RequestOrResponse => Size (RequestMessage | ResponseMessage)
  Size => int32
```
The message_size field gives the size of the subsequent request or response message in bytes. The client can read requests by first reading this 4-byte size as an integer N, and then reading and parsing the subsequent N bytes of the request.

## Header and Body of Request and Response
There are several versions of requests and responses, each with distinct headers and bodies. You can reference all of them in the [Apache Kafka documentation](https://kafka.apache.org/protocol.html#protocol_messages)

## Client Request Example

Let's illustrate a simple example of a client request to the broker. A common request is to fetch metadata information.

Consider a request that follows this structure:

```javascript
// This is a simplified example. In a real-world scenario, the request would conform to Kafka's protocol.
const requestBuffer = Buffer.concat([
  Buffer.alloc(4), // message_size: This will be filled with the full size of the message.
  Buffer.from([0x00, 0x03]), // request_api_key: The API key for the Metadata request.
  Buffer.from([0x00, 0x01]), // request_api_version: The version of the API being used.
  Buffer.alloc(4), // correlation_id: An ID to match requests to responses. (e.g., a random integer)
  Buffer.from("clientId"), // client_id: The ID of the client making the request.
]);
```

You can explore an example of an API version request sent by a client to a Kafka broker by visiting [this link](https://binspec.org/kafka-api-versions-request-v4).

## Sending a Response from the Server

Now let's send a [response header v0](https://kafka.apache.org/protocol.html#protocol_messages) from the server we configured. We will send back the message_size and correlation_id.

### Response header v0 structure
```
Response Header v0 => correlation_id 
  correlation_id => INT32
```

```javascript
import net from "net";

const sendResponseMessage = (connection, messageObj) => {
  return connection.write(Buffer.concat(Object.values(messageObj)));
};

const server = net.createServer((connection) => {
  connection.on("data", (buffer) => {
    const correlationId = buffer.subarray(8, 12);
    const messageSize = Buffer.from([0, 0, 0, correlationId.length]);

    const responseMessage = {
      messageSize,
      correlationId,
    };

    return sendResponseMessage(
      connection,
      responseMessage,
    );
  });
}

server.listen(9092, "127.0.0.1");
```

In the example above, whenever the client sends a request message, we parse the `correlationId` then calculate the `message size` and send back a response containing these fields.

## Conclusion
In this blog, we've explored Apache Kafka, the role of Kafka brokers, how to create a broker server, and how to send a response message with the correlation ID when a client sends a request message.

You can find the sample implementation in this [Github Repo](https://github.com/abhirampai/codecrafters-kafka-javascript/commit/fcaed61b43f898a1a5cc53c674439c87403636ad)

In the next blog, we will see how to parse requests with different request API keys.
