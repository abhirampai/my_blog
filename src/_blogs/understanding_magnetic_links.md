This is the fifth part & the final part of our BitTorrent series, in our [previous blog](/lets_implement_bittorrent_from_scratch_part_3) we explored how to download a file piece-by-piece and extend it to download a full file. Now, let’s delve into the world of magnet links and understand how they enhance the BitTorrent experience.


### What are Magnet Links?
[Magnet links](https://www.bittorrent.org/beps/bep_0009.html) are a powerful feature of the BitTorrent protocol. They allow users to download files directly without needing a torrent file. Instead of relying on a .torrent file to initiate a download, a magnet link contains all the information required to connect to peers and start downloading data.

### The Magnet URI Format

The basic format of a magnet URI looks like this:
```
v1: magnet:?xt=urn:btih:<info-hash>&dn=<name>&tr=<tracker-url>&x.pe=<peer-address>
v2: magnet:?xt=urn:btmh:<tagged-info-hash>&dn=<name>&tr=<tracker-url>&x.pe=<peer-address>
```

- <b>info-hash</b> A 40-character hexadecimal-encoded string.
- <b>tracker-url</b> The URL of the tracker that assists in acquiring peer information and request intervals.
- <b>peer-address</b> The address of the peer in the format of hostname:port.

### Extending BitTorrent for Magnet Links
In earlier parts of this series, we discussed peer acquisition via TCP connections and the handshake process. To support protocol extensions for magnet links, the handshake payload requires slight modifications.

As explained in the [third blog](/lets_implement_bittorrent_from_scratch_part_2) of our series, the handshake payload contains 8 reserved bytes. To enable extensions in the BitTorrent protocol, set the reserved bytes as shown below:
```
00 00 00 00 00 10 00 00
```
By setting the fifth byte to 10 (or 16 in hexadecimal), we inform peers that we are using protocol extensions. Then, proceed with sending the handshake.

Once the handshake is sent, we follow with the bitfield message. Here, the process remains the same as in previous steps.

Now to communicate with other peer we need to have their extension ID. For that purpose, we need to send an extension handshake message which looks like the following

```
{'m': {'ut_metadata', 3}, 'metadata_size': 31235}
```

In this example, 3 is the peer's extension ID. You may choose any ID.

### Extension handshake format

The format for extension messages builds upon the traditional BitTorrent message structure:
- <b>Message length</b>: 4 bytes
- <b>Message id</b>: 1 byte
- <b>Payload</b>: Variable size.

The payload itself contains:
- <b>Extension message id</b> 1 bytes ( the value will be 0 for extension handshake )
- <b>Bencoded dictionary</b> This will contain the extension handshake message we saw previously with m as the key and another dictionary as the value.

After this step, we receive the handshake and it will contain the payload with the key `ut_metadata` that has the value for peer ID.

### Types of Extension Messages

The protocol defines several message types for extensions, including:

- <b>Request</b>: `msg_type 0` - Request the data
- <b>Data</b>: `msg_type 1` - Sends a piece of metadata to peer
- <b>Reject</b>: `msg_type 2` - The peer doesn't have the metadata

Moving forward, the file download process follows similarly to the previous steps discussed in the series.

### Conclusion
This wraps up our series on BitTorrent. For a practical implementation of magnet links using Ruby, check out this [Github Repository](https://github.com/abhirampai/codecrafters-bittorrent-ruby).

By understanding and utilizing magnet links, you can harness the full potential of decentralized file distribution with BitTorrent. Thank you for following along!
