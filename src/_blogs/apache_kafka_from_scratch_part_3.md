In our [previous blog](/apache_kafka_from_scratch_part_2) we saw about DescribeTopics Api request and response. In this blog we will focus on Fetch Api request and response.

## Enhancing the API Versions Response with Fetch API
The Fetch API has an ApiKey of 1. The minimum version for Fetch API is 0 and the max version is 17. Let's update our existing ApiVersions request handler to incorporate details for the Fetch API.

Lets modify the contents of constant.js file
```javascript
export const API_KEY_VERSIONS = [...Array(5).keys()];

export const DESCRIBE_TOPIC_PARTITION_VERSIONS = [0];

export const FETCH_API_VERSIONS = [...Array(17).keys()];

export const API_KEYS = {
  1: FETCH_API_VERSIONS,
  18: API_KEY_VERSIONS,
  75: DESCRIBE_TOPIC_PARTITION_VERSIONS,
};
```

## Fetch API request structure
```
Fetch Request (Version: 17) => max_wait_ms min_bytes max_bytes isolation_level session_id session_epoch [topics] [forgotten_topics_data] rack_id TAG_BUFFER 
  max_wait_ms => INT32
  min_bytes => INT32
  max_bytes => INT32
  isolation_level => INT8
  session_id => INT32
  session_epoch => INT32
  topics => topic_id [partitions] TAG_BUFFER 
    topic_id => UUID
    partitions => partition current_leader_epoch fetch_offset last_fetched_epoch log_start_offset partition_max_bytes TAG_BUFFER 
      partition => INT32
      current_leader_epoch => INT32
      fetch_offset => INT64
      last_fetched_epoch => INT32
      log_start_offset => INT64
      partition_max_bytes => INT32
  forgotten_topics_data => topic_id [partitions] TAG_BUFFER 
    topic_id => UUID
    partitions => INT32
  rack_id => COMPACT_STRING
```
You can know more about the Fetch API request [here](https://kafka.apache.org/protocol.html#The_Messages_Fetch).

Similar to how we parsed the topics and partitions in our previous blog we can follow the same here too.

## Fetch API response
```
Fetch Response (Version: 17) => throttle_time_ms error_code session_id [responses] TAG_BUFFER 
  throttle_time_ms => INT32
  error_code => INT16
  session_id => INT32
  responses => topic_id [partitions] TAG_BUFFER 
    topic_id => UUID
    partitions => partition_index error_code high_watermark last_stable_offset log_start_offset [aborted_transactions] preferred_read_replica records TAG_BUFFER 
      partition_index => INT32
      error_code => INT16
      high_watermark => INT64
      last_stable_offset => INT64
      log_start_offset => INT64
      aborted_transactions => producer_id first_offset TAG_BUFFER 
        producer_id => INT64
        first_offset => INT64
      preferred_read_replica => INT32
      records => COMPACT_RECORDS
```

Lets look into how to parse the required data and send the response

```javascript
const clientLength = buffer.subarray(12, 14);
const clientLengthValue = clientLength.readInt16BE();
const sessionIdIndex = clientLengthValue + 28; // skip 15 bytes before and 13 bytes after client record
  const sessionId = buffer.subarray(sessionIdIndex, sessionIdIndex + 4);
  const _sessionEpoch = buffer.subarray(sessionIdIndex + 4, sessionIdIndex + 8);
  const topicArrayLength = buffer.subarray(
    sessionIdIndex + 8,
    sessionIdIndex + 9,
  );

  let topicIndex = sessionIdIndex + 9;
  if (topicArrayLength.readInt8() > 1) {
    const topics = new Array(topicArrayLength.readInt8() - 1)
      .fill(0)
      .map((_) => {
        const topicId = buffer.subarray(topicIndex, topicIndex + 16);
        topicIndex += 16;

        const logFile = fs.readFileSync(
          `/tmp/kraft-combined-logs/__cluster_metadata-0/00000000000000000000.log`,
        );
        const logFileIndex = logFile.indexOf(topicId);
        let partitionError = Buffer.from([0, 100]);
        let topicName = "";

        if (logFileIndex !== -1) {
          partitionError = Buffer.from([0, 0]);
          topicName = logFile.subarray(logFileIndex - 3, logFileIndex);
        }

        const partitionArrayIndex = topicIndex;
        const partitionLength = buffer.subarray(
          partitionArrayIndex,
          partitionArrayIndex + 1,
        );
        const partitionIndex = buffer.subarray(
          partitionArrayIndex + 1,
          partitionArrayIndex + 5,
        );

        const highWaterMark = Buffer.from(new Array(8).fill(0));
        const last_stable_offset = Buffer.from(new Array(8).fill(0));
        const log_start_offset = Buffer.from(new Array(8).fill(0));
        const aborted_transactions = Buffer.from([0]);
        const preferredReadReplica = Buffer.from([0, 0, 0, 0]);
        const recordBatch =
          logFileIndex === -1
            ? Buffer.from([0])
            : readFromFileBuffer(topicName.toString(), partitionIndex);

        console.log("recordBatch", recordBatch);
        const partitionArrayBuffer = Buffer.concat([
          partitionLength,
          partitionIndex,
          partitionError,
          highWaterMark,
          last_stable_offset,
          log_start_offset,
          aborted_transactions,
          preferredReadReplica,
          recordBatch,
          tagBuffer,
        ]);

        return Buffer.concat([topicId, partitionArrayBuffer, tagBuffer]);
      });

    responses = Buffer.concat([topicArrayLength, ...topics]);
  }

  let fetchRequestResponse = {
    correlationId: responseMessage.correlationId,
    responseHeaderTagbuffer: tagBuffer,
    throttleTime,
    errorCode,
    sessionId,
    responses,
    tagBuffer,
  };

  const messageSizeBuffer = Buffer.alloc(4);
  messageSizeBuffer.writeInt32BE([
    Buffer.concat(Object.values(fetchRequestResponse)).length,
  ]);
  fetchRequestResponse = {
    messageSize: messageSizeBuffer,
    ...fetchRequestResponse,
  };

  sendResponseMessage(connection, fetchRequestResponse);

const readFromFileBuffer = (topicName, partitionIndex) => {
  const topicFile = fs.readFileSync(
    `/tmp/kraft-combined-logs/${topicName}-${partitionIndex.readInt32BE()}/00000000000000000000.log`,
  );

  return Buffer.concat([Buffer.from([2]), topicFile]);
};
```

## Conclusion
In this blog we saw about Fetch API request and response.

For a full implementation in JavaScript, check out the following [Github Repository](https://github.com/abhirampai/codecrafters-kafka-javascript/blob/master/app/fetch_api_request.js).

