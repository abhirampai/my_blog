In the [previous blog](/lets_implement_bittorrent_from_scratch_part_0) we saw how we can encode and decode bencoded strings which is the format used for communication between the peers and trackers in the BitTorrent protocol.

In this blog we will be looking what a torrent file is and what all details it would hold.

So a torrent file (or metainfo file) is nothing but a file that contains info about which all files / folders need to be distributed. The data inside of this file is in the bencoded dictionary format.
It contains the following keys:
#### Announce
This contains the URL of the tracker (central servers that have information about the peers that share and download torrent).
#### Info 
This is a dictionary having the following keys:
    -  piece length -> corresponds to the number of bytes each piece is split into.
    -  pieces -> It is a concatenated SHA1-hashes of each piece.
    -  name -> Suggested name for saving the file / folder.
    -  length -> It is the size of file in bytes, this key would be present if we are downloading a single file.
    -  files -> It's a dictionary that represents a set of file would be present if we are downloading multiple files.

 To know more about metainfo file you can refer https://bittorrent.org/beeps/bep_0003.html#metainfo-files

### Parsing torrent file keys
 Lets now see the pseudo code to decode the information from torrent file:

 1. Open the file and get the contents.
 2. Decode the contents using the decode method we saw in the [first blog](lets_implement_bittorrent_from_scratch_part_0). Store the decoded info in a decoded_file variable.
 3. We should now have the Announce and Info keys in the decoded file variable.

### Using the tracker to get the peers

Now lets look into how to make a tracker get request to get the peers.

#### Tracker request
Before that lets look into what all keys are needed to make the request.
##### info hash
Info hash is a 20byte sha1 hash of the bencoded form of the info value from the metainfo file.
```ruby
bencoded_info = encode(decoded_file[info]) // refer to encode method we saw in the first blog
Digest::SHA1.digest(bencoded_info)
```

##### peer_id
Its a string of length 20 which the downloader uses as its id. It is randomly generated.
```ruby
SecureRandom.alphanumeric(20)
```

##### port
The port number corresponds to the port this peer is listening on.

##### uploaded
Total amount uploaded so far.

##### downloaded
Total amount downloaded so far.

##### left
Number of bytes left to fownload.

##### compact
Whether the peer list should use [compact representation](bittorrent.org/beeps/bep_0023.html).

To know more about the query params refer https://bittorrent.org/beeps/bep_0003.html#trackers

Now lets look into the response we would be receiving:

#### Tracker response
The response to the tracker get request would be having the following keys in the bencoded dictionary format:
##### interval
An integer indicating how often the client should be making a request to the tracker.

##### peers
It's a string containing the list of peers that the client can connect to.
Each peer is 6 bytes in length. First 4 bytes corresponds to the `peer_ip_address` & the next 2 bytes corresponds to the `peer port number`

Now lets look into the pseudo code for making tracker get request & parsing the response

1. Follow the pseudocode above to decode the file contents.
2. Get the 20byte sha1 info hash.
3. Set the query params to be sent for the get request
```ruby
query = {
  info_hash: Digest::SHA1.digest(encode(decoded_file['info'])),
  peer_id: SecureRandom.alphanumeric(2),
  port: 6881,
  uploaded: 0, // setting uploaded and downloaded to 0 since we have not uploaded or downloaded anything
  downloaded: 0,
  left: decoded_file['length'], // setting left to the length of file since we have not downloaded anything
  compact: 1 // to use the compact representation
}
```
4. Send the get request to the url in the announce key of the decoded_file.
```ruby
### Sample implementation using ruby
uri = URI(decoded_file[announce])
uri.query = URI.encode_www_form(query)
response = Net::HTTP.get(uri)
```

5. Now lets decode the response.
```ruby
### Sample implementation using ruby
decoded_response = decode(response) // refer to the decode we discussed in the first blog.
```

6. Now lets get the interval and peers
```ruby
interval = decoded_response['interval']
peers = decoded_response['peers']
```
7. Now lets convert the peers to the format <peer_ip_address>:<peer_port>
```ruby
peers.scan(/.{6}/).map do |peer| // scan will chop the string into chunks of given length, here it is 6
  peer_ip_address = peer[0..3].unpack("C*").join(".") // Using unpack to convert the string which in hex form to decimal form (8 bit unsigned) * represents the number of elements can be any we could also use 4 here since we know peer address is 4 bytes in length.
  peer_port = peer[4..5].unpack1("n") // Convert hex to decimal
  "#{peer_ip}:#{peer_port}" // returning the string in the format <peer_ip>:<peer_port>
end
```

Now we have the peers to which we can connect and download files.

### Conclusion
In this blog we saw 
- What is a torrent file and what are contents inside of it.
- How we can generate info_hash
- How we can make a tracker get request.
- How to decode the tracker get request response and also format the peer_ip_address & peer_port.

You can find a sample implementation of finding peers using ruby [here](https://github.com/abhirampai/codecrafters-bittorrent-ruby/blob/master/app/bit_torrent_client.rb#L36).

We will look into peer handshaking and downloading piece in the next blog.
