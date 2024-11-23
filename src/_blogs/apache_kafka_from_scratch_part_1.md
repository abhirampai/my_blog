In our [previous blog](apache_kafka_from_scratch_part_0), we explored Apache Kafka, the role of Kafka brokers, how to set up a broker server, and how to send a response message with a correlation ID when a client sends a request message. In this blog, we will delve into handling various Kafka APIs.

## Kafka APIs
Every Kafka request is essentially an API call. In this blog series, we will focus on some of the key API calls:

1. `ApiVersions`: Returns the broker-supported API versions.
2. `DescribeTopicPartitions`:  Describes the topics and partitions within those topics.
3. `Fetch`: Retrieves data from topics and partitions.

For a comprehensive list of available Kafka APIs, please visit the [Kafka documentation](https://kafka.apache.org/protocol.html#protocol_api_keys).

Let's start with the ApiVersions API request.

### ApiVersions API

![ApiVersions Request](/assets/ApiVersionsRequest.png "ApiVersions Request sent by client")

An ApiVersions API request has the following structure:

```
Message Size -> 4 bytes
API key -> 2 bytes, which is 18 for APIVersion
API version -> 2 bytes, the version of request and response to be used. We will use version 4.
CorrelationId -> 4 bytes, id to match the responses.
Client Id -> 
  - Length -> 2 bytes
  - Contents -> variable size
Tag Buffer -> An empty tagged field array, represented by a single byte of value 0x00.
Client Software Name ->
  - Length -> 1 byte
  - Content -> variable size
Client Version ->
  - Length -> 1 byte
  - Content -> variable size
Tag Buffer
```

A sample request sent by a client can be viewed [here](https://binspec.org/kafka-api-versions-request-v4).

## Parsing API Key and Version

When a client sends a request, we first need to parse the API key and version. The following code snippet demonstrates how this can be achieved:

```
const requestApiKey = buffer.subarray(4, 6);
const requestApiVersion = buffer.subarray(6, 8);
```

## Handling API Requests and Sending Responses

![ApiVersions Response](/assets/ApiVersionsRequest.png "ApiVersions Response sent by kafka broker")

Since we will be using version 4 of the ApiVersions API response, its structure looks like this:

```
ApiVersions Response (Version: 4) => error_code [api_keys] throttle_time_ms TAG_BUFFER 
  error_code => INT16
  api_keys => api_key min_version max_version TAG_BUFFER 
    api_key => INT16
    min_version => INT16
    max_version => INT16
  throttle_time_ms => INT32

Error Code -> The top-level error code.
ApiKeys -> Returns an array of api key, min_version of api and max_version of api. For APIVersion request the min_version is 0 and max_version is 4.
throttle_time_ms -> The duration in milliseconds for which the request was throttled due to a quota violation, or zero if the request did not violate any quota.
```

Next, let's implement this in our broker server. We'll create a file named `api_versions_request.js` to handle the request:

```
const API_KEY_VERSIONS = [...Array(5).keys()];

export const handleApiVersionsRequest = (
  connection,
  responseMessage,
  requestVersion,
) => {
  const errorCode = Buffer.from([0, 0]);
  const maxVersion = Buffer.from([0, 4]);
  const minVersion = Buffer.from([0, 0]);
  const throttleTimeMs = Buffer.from([0, 0, 0, 0]);
  const tagBuffer = Buffer.from([0]);
  const apiKeyLength = Buffer.from([2]);
  
  const updatedResponseMessage = {
    ...responseMessage,
    errorCode,
    apiKeyLength,
    maxVersion,
    minVersion,
    arrayTagBuffer: tagBuffer,
    throttleTimeMs,
    tagBuffer,
  };
  if (!API_KEY_VERSIONS.includes(requestVersion)) {
    updatedResponseMessage.errorCode = Buffer.from([0, 35]);
    sendResponseMessage(
      connection,
      pick(updatedResponseMessage, "messageSize", "correlationId", "errorCode"),
    );
  } else {
    updatedResponseMessage.messageSize = Buffer.from([0, 0, 0, 19]);
    sendResponseMessage(
      connection,
      pick(
        updatedResponseMessage,
        "messageSize",
        ...apiVersioningResponseFields(requestVersion),
      ),
    );
  }
};
```

In the main code, we check if the request API key is 18 and utilize the above method:

```
if (requestApiKey.readInt16BE() === 18) {
  handleApiVersionsRequest(connection, responseMessage, requestVersion);
} else {
  sendResponseMessage(
    connection,
    pick(responseMessage, "messageSize", "correlationId"),
  );
}
```

For more information on the ApiVersions request and response, please refer to the [Kafka documentation](https://kafka.apache.org/protocol.html#The_Messages_ApiVersions)

### Conclusion
In this blog, we discussed Kafka APIs with a focus on the API version requests and responses, including how to handle these in your broker. For a sample implementation, check out this [Github repository](https://github.com/abhirampai/codecrafters-kafka-javascript/commit/0aa0b63068d6c1eda16375c690283c36e64171f3#diff-5f5ac547707d85825f5ce55d9deb200422b29d711b82263eb4bd3a1cab6a661a)

In the next blog, we will explore handling the DescribeTopicPartitions API.

