In our [previous blog post](/apache_kafka_from_scratch_part_1), we explored API Versions request and response structure. This time, we'll delve into the details of the Describe Topics API, including how to handle its requests and responses.

## Enhancing the API Versions Response with Describe Topics API
To begin with, the Describe Topics API has an ApiKey of 75. Both the minimum and maximum version of the request/response supported for this API is 0. Let's update our existing ApiVersions request handler to incorporate details for the Describe Topics API.

First, let's extract constants into a new constants.js file:
```javascript
export const API_KEY_VERSIONS = [...Array(5).keys()];

export const DESCRIBE_TOPIC_PARTITION_VERSIONS = [0];

export const API_KEYS = {
  18: API_KEY_VERSIONS,
  75: DESCRIBE_TOPIC_PARTITION_VERSIONS,
};
```

Next, let's modify the handleApiVersionsRequest function as follows:

```javascript
import { API_KEY_VERSIONS, API_KEYS } from './constants.js'

export const handleApiVersionsRequest = (
  connection,
  responseMessage,
  requestVersion,
) => {
  const errorCode = Buffer.from([0, 0]);
  const throttleTimeMs = Buffer.from([0, 0, 0, 0]);
  const tagBuffer = Buffer.from([0]);
  const apiKeyLength = Buffer.from([Object.keys(API_KEYS).length + 1]);
  let updatedResponseMessage = { ...responseMessage, errorCode, apiKeyLength };

  Object.entries(API_KEYS).map(([responseApiKey, versions]) => {
    const minVersion = Buffer.from([0, versions[0]]);
    const maxVersion = Buffer.from([0, versions[versions.length - 1]]);
    const key = `${responseApiKey}ApiKeys`;
    const responseApiKeyBuffer = Buffer.from([0, parseInt(responseApiKey)]);
    updatedResponseMessage = {
      ...updatedResponseMessage,
      [key]: Buffer.concat([
        responseApiKeyBuffer,
        minVersion,
        maxVersion,
        tagBuffer,
      ]),
    };
  });

  updatedResponseMessage = {
    ...updatedResponseMessage,
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
    const messageSize = calculateMessageSize(
      updatedResponseMessage,
      requestVersion,
    );
    updatedResponseMessage.messageSize = Buffer.from([0, 0, 0, messageSize]);

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

When sending an ApiVersions request, the response now includes two ApiKey arrays: one for ApiVersions and another for the Describe Topics API.

## Describe Topics API Request Structure
```
Message Size -> 4 bytes
API key -> 2 bytes, which is 18 for APIVersion
API version -> 2 bytes, the version of request and response to be used. We will use version 4.
CorrelationId -> 4 bytes, id to match the responses.
Client Id -> 
  - Length -> 2 bytes
  - Contents -> variable size
Tag Buffer -> An empty tagged field array, represented by a single byte of value 0x00.
Topics array length -> 1 byte
  TopicName ->
    - Length - 1 byte
    - Content - variable size
  Tag Buffer
Response Partition Limit -> 4 bytes, limits the number of partitions in the response
Cursor -> 1 byte, a nullable field used for pagination
Tag Buffer
```
You can view a sample request sent by a client [here](https://binspec.org/kafka-describe-topic-partitions-request-v0).

### Parsing topics

```javascript
const clientLength = buffer.subarray(12, 14);
const clientLengthValue = clientLength.readInt16BE();
const tagBuffer = Buffer.from([0]);

const topicArrayLength =
  buffer.subarray(clientLengthValue + 15, clientLengthValue + 16).readInt8() -
  1;

let topicIndex = clientLengthValue + 16;
const topics = new Array(topicArrayLength).fill(0).map((_) => {
  const topicLength = buffer.subarray(topicIndex, topicIndex + 1);
  topicIndex += 1;
  const topicName = buffer.subarray(
    topicIndex,
    topicIndex + topicLength.readInt8() - 1,
  );

  topicIndex += topicLength.readInt8();
  return [topicLength, topicName];
});
```
With the topics parsed, we can now proceed to send a response.

## Describe Topics Api Response
```
DescribeTopicPartitions Response (Version: 0) => throttle_time_ms [topics] next_cursor TAG_BUFFER 
  throttle_time_ms => INT32
  topics => error_code name topic_id is_internal [partitions] topic_authorized_operations TAG_BUFFER 
    error_code => INT16
    name => COMPACT_NULLABLE_STRING
    topic_id => UUID
    is_internal => BOOLEAN
    partitions => error_code partition_index leader_id leader_epoch [replica_nodes] [isr_nodes] [eligible_leader_replicas] [last_known_elr] [offline_replicas] TAG_BUFFER 
      error_code => INT16
      partition_index => INT32
      leader_id => INT32
      leader_epoch => INT32
      replica_nodes => INT32
      isr_nodes => INT32
      eligible_leader_replicas => INT32
      last_known_elr => INT32
      offline_replicas => INT32
    topic_authorized_operations => INT32
  next_cursor => topic_name partition_index TAG_BUFFER 
    topic_name => COMPACT_STRING
    partition_index => INT32
```

Now let's look into how we can get all this data.

## Cluster metadata file

Kafka stores metadata about topics in the `__cluster_metadata` topic. To check if a topic exists or not, we'll need to read the `__cluster_metadata` topic's log file. For this example lets assume the file is stored in `./tmp/__cluster_metadata-0/00000000000000000000.log`

### Checking if the topic exists
```javascript
const logFile = fs.readFileSync(
    `./tmp/__cluster_metadata-0/00000000000000000000.log`,
  );

topics.forEach(([topicLength, topicName], index) => {
let topicIndexInLogFile = logFile.indexOf(topicName);
    if (topicIndexInLogFile !== -1) {
      // Topic is present error code is 0
    } else {
      // Topic is unknown the error code is 3
    }
})
```

### Now let's look into how we can get all this data.
A sample cluster metadata file can be found [here](https://binspec.org/kafka-cluster-metadata). Important fields include:

```
TopicUUID,
partitionId,
leaderId,
leaderEppoch,
replicaArray,
isrNodesArray
```

### Parsing Required Fields
```javascript
topicIndexInLogFile = topicIndexInLogFile + topicLength.readUInt8() - 1;
topicId = logFile.subarray(topicIndexInLogFile, topicIndexInLogFile + 16);
let topicLogs = logFile.subarray(topicIndexInLogFile + 16);

let partitionIndex = topicLogs.indexOf(topicId);
while (partitionIndex !== -1) {
  const partitionErrorCode = Buffer.from([0, 0]);
  const partitionId = topicLogs.subarray(
    partitionIndex - 4,
    partitionIndex,
  );

  const [replicaArrayLength, replicaArray, replicaIndex] =
    handleReplicaAndIsrNodes(partitionIndex + 16, topicLogs);

  const replicaArrayBuffer = Buffer.concat([
    replicaArrayLength,
    ...replicaArray,
  ]);

  const [isrNodesArrayLength, isrNodes, isrNodesIndex] =
    handleReplicaAndIsrNodes(replicaIndex, topicLogs);

  const isrNodesBuffer = Buffer.concat([
    isrNodesArrayLength,
    ...isrNodes,
  ]);

  let leaderIndex = isrNodesIndex + 2;

  const leaderId = topicLogs.subarray(leaderIndex, leaderIndex + 4);
  const leaderEppoch = topicLogs.subarray(
    leaderIndex + 4,
    leaderIndex + 8,
  );

  topicLogs = topicLogs.subarray(leaderIndex + 8);

  partitions.push(
    Buffer.concat([
      partitionErrorCode,
      partitionId,
      leaderId,
      leaderEppoch,
      replicaArrayBuffer,
      isrNodesBuffer,
      tagBuffer,
      tagBuffer,
      tagBuffer,
      tagBuffer,
    ]),
  );

  partitionIndex = topicLogs.indexOf(topicId);
  if (partitionIndex === -1) {
    break;
  }
}

partitionBuffer = Buffer.concat([
  Buffer.from([partitions.length + 1]),
  ...partitions,
]);

const handleReplicaAndIsrNodes = (arrayIndex, topicLogs) => {
  const lengthOfArray = topicLogs.subarray(arrayIndex, arrayIndex + 1);
  const arrayLengthIn8 = lengthOfArray.readInt8() - 1;
  arrayIndex += 1;
  const arrayNodes = new Array(arrayLengthIn8).fill(0).map((_) => {
    const replica = topicLogs.subarray(arrayIndex, arrayIndex + 4);
    arrayIndex += 4;
    return replica;
  });

  return [lengthOfArray, arrayNodes, arrayIndex];
};
```

## Conclusion
In this blog we saw about Describe topics API in detail, how to handle requests, gather topic metadata from the cluster metadata file, and construct a response.

For a full implementation in JavaScript, check out the following [Github Repository](https://github.com/abhirampai/codecrafters-kafka-javascript/blob/master/app/describe_topic_partitions_request.js)

In our next blog post, we will explore the Fetch Request API.
