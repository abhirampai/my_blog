In our [previous blog](/lets_implement_bittorrent_from_scratch_part_0) we explored how to encode and decode bencoded strings, which are essential for communication between peers and trackers in the BitTorrent protocol.

Today, we're going to delve into the torrent file structure and understand the information it contains.

A torrent file, also known as a metainfo file, is a file that holds metadata about the files or folders to be distributed. The data in this file is stored in a bencoded dictionary format and contains the following keys:
#### Announce
This key contains the URL of the tracker, which are central servers that maintain information about peers participating in the torrent.
#### Info 
This is a dictionary having the following keys:
-  piece length -> This corresponds to the number of bytes each piece is divided into.
-  pieces -> This key contains a concatenated SHA1-hash of each piece.
-  name -> This suggests a name for saving the file or folder.
-  length -> This key represents the size of the file in bytes and is present when downloading a single file.
-  files -> This key is a dictionary representing a set of files and is present when downloading multiple files.

You can find more information about metainfo files in the [BitTorrent specification](https://bittorrent.org/beeps/bep_0003.html#metainfo-files)

### Parsing torrent file keys
 Now, let's look at a pseudo-code example to decode information from a torrent file:

 1. Open the file and retrieve its contents.
 2. Decode the contents using the decode method discussed in our [first blog](lets_implement_bittorrent_from_scratch_part_0). and store the decoded information in a `decoded_file` variable.
 3. The `decoded_file` variable should now contain the Announce and Info keys.

### Interacting with the Tracker to Get Peers

Next, we'll discuss how to make a GET request to a tracker to obtain a list of peers.

#### Tracker request
First, let's examine the necessary keys for making this request.

##### info_hash
The info hash is a 20-byte SHA1 hash of the bencoded form of the info value from the metainfo file.
```ruby
bencoded_info = encode(decoded_file[info]) # Refer to the encode method in the first blog
Digest::SHA1.digest(bencoded_info)
```

##### peer_id
This is a randomly generated 20-character string that the downloader uses as its unique identifier.
```ruby
SecureRandom.alphanumeric(20)
```

##### port
This is the port number on which this peer is listening.

##### uploaded
This key represents the total amount of data uploaded so far.

##### downloaded
This key represents the total amount of data downloaded so far.

##### left
This key indicates the number of bytes left to download.

##### compact
This boolean value specifies whether the peer list should use a [compact representation](bittorrent.org/beeps/bep_0023.html).
For more information about these query parameters, please refer to the [BitTorrent specification](https://bittorrent.org/beeps/bep_0003.html#trackers).

Now, let's discuss the response we can expect from the tracker.

#### Tracker response
The tracker's response to our GET request contains the following keys in a bencoded dictionary format:

##### interval
An integer indicating how often the client should make requests to the tracker.

##### peers
A string containing a list of peers the client can connect to. Each peer is represented by 6 bytes, with the first 4 bytes for the `peer_ip_address` and the next 2 bytes for the `peer_port_number`.

Now, let's examine the pseudo-code for making a tracker GET request and parsing the response:

1. Follow the pseudo-code above to decode the file contents.
2. Generate the 20-byte sha1 info hash.
3. Set the query parameters for the GET request.
```ruby
query = {
  info_hash: Digest::SHA1.digest(encode(decoded_file['info'])),
  peer_id: SecureRandom.alphanumeric(20),
  port: 6881,
  uploaded: 0, # We set uploaded and downloaded to 0 since we haven't uploaded or downloaded anything yet
  downloaded: 0,
  left: decoded_file['length'], # We set 'left' to the file length since we haven't downloaded anything yet
  compact: 1 # To use the compact representation
}
```
4. Send the GET request to the URL in the 'announce' key of the `decoded_file`.
```ruby
### Sample implementation using ruby
uri = URI(decoded_file[announce])
uri.query = URI.encode_www_form(query)
response = Net::HTTP.get(uri)
```

5. Decode the response.
```ruby
### Sample implementation using ruby
decoded_response = decode(response) # Refer to the decode method discussed in the first blog
```

6. Retrieve the interval and peers.
```ruby
interval = decoded_response['interval']
peers = decoded_response['peers']
```
7. Convert the peers to the format `<peer_ip_address>:<peer_port>`.
```ruby
peers.scan(/.{6}/).map do |peer| # Scan chops the string into 6-byte chunks
  peer_ip_address = peer[0..3].unpack("C*").join(".") # Convert hex to decimal
  peer_port = peer[4..5].unpack1("n") # Convert hex to decimal
  "#{peer_ip}:#{peer_port}" # Return the string in the format <peer_ip>:<peer_port>
end
```

Now we have the peers to which we can connect and download files.

### Conclusion
In this blog, we've covered:
- The structure and contents of a torrent file.
- How to generate an info hash.
- How to make a tracker GET request.
- How to decode the tracker GET request response and parse `peer_ip_address` & `peer_port`.

For a sample implementation of finding peers using Ruby, you can refer to this [Github Repository](https://github.com/abhirampai/codecrafters-bittorrent-ruby/blob/master/app/bit_torrent_client.rb#L36).

In our next blog, we'll discuss peer handshaking.
