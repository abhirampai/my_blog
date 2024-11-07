In our [previous blog](/lets_implement_bittorrent_from_scratch_part_1), we learnt more about the structure and contents of the torrent file, how to generate the info hash, how to send a get request to the tracker url inorder to get the peers.

In this blog we would be diving into the details of how to establish a tcp connection with the peer and complete a handshake.

Now lets look into how we can make a tcp request to the peer.

In the previous blog we saw how we can get the peer's address and port, we would be establishing a tcp connection with any one of the peer from that.

Now lets look into the handshake message.

A handshake message consists of the following keys:

- Length of the protocol string which is "BitTorrent protocol" which is 19. ( 1byte )
- The string BitTorrent protocol ( 19 bytes )
- Eigth reserved bytes which are all zeros ( 8 bytes )
- Sha1 hash ( 20 bytes )
- peer_id (20 bytes)

Total length of a handshake_message is 68 bytes.

Once we send a handshake we would receive a symmetric handshake message back. To validate the handshake we have to validate the info hashes. To know more about the same refer the [BitTorrent specification](https://www.bittorrent.org/beps/bep_0003.html#peer-protocol).

Now lets write the psuedocode for the same.

1. Get the peers by sending the get request to the tracker. Refer previous blog to see how this is done.
2. Now establish a tcp connection with any one of the peer.
```ruby
peer_ip = <address_of_the_peer>
peer_port = <port_number_of_the_peer>
reserved_bytes = "\x00" * 8 # 8 reserved_bytes
protocol_length = [19].pack('C') # pack into binary sequence
protocol_string = "BitTorrent protocol"
sha1_hash = <sha1_hash_info_hash> # sha1 info hash which was calculated in the previous blog
peer_id = SecureRandom.alphanumeric(20) # random numeric of 20 bytes

handshake_message = protocol_length + protocol_string + sha1_hash + peer_id

socket = Tcp.open(peer_ip, peer_port) # opens a tcp socket
socket.write(handshake_message) # writes a handshake_message to the socket
```
3. Now lets read the message send back by the peer and validate the handshake.
```
response = socket.read(68) # 68 bytes is read since the total length of the handshake_message is 68
_, _, _, info_hash, _ = response.unpack('C A19 A8 A20 H*') # Converting the message from binary format to its actual format
if info_hash == sha1_hash
# handshake valid
else
# throw invalid info hash
end
```

### Conclusion

In this blog we saw how we can establish a tcp connection with a peer, send a handshake message and validate the handshake message send back by the peer.

For a sample implementation of tcp connection with a peer and validation of handshake refer this [Github Repository](https://github.com/abhirampai/codecrafters-bittorrent-ruby/blob/master/app/tcp_connection.rb#L57C5-L69C8)

In the next blog we would be looking into how to download a piece of file and save it to the disk.
