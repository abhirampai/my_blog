In our [previous blog](/lets_implement_bittorrent_from_scratch_part_2), we explored how to establish TCP connections with peers and how to exchange and validate handshake messages in a BitTorrent network.

In this blog, we'll dive into the process of downloading a piece of a file once the handshake is completed. To achieve this, the client must exchange several peer messages with the peer.

### Peer messages

Peer messages consist of:
- <b>Message length</b>: 4 bytes
- <b>Message ID</b>: 1 byte
- <b>Payload</b>: Variable size, depending on the type of message

#### Key Messages to Exchange Post-Handshake
1. After the handshake is completed the client needs to wait for a `bitfield` message from the peer, indicating the piece it has.
   - The message ID is 5.
   - In the payload, we will have the available pieces the peer has.
2. Next the client needs to send an `interested` message
   - The message ID is 2.
   - Payload is empty.
3. Now the client needs to wait until it receives an `unchoke` message from the peer.
   - The message ID is 1.
   - Payload is empty.
4. Now the client breaks down the piece into 16KiB (16 * 1024 bytes) and sends a `request` message per byte.
   - The message ID is 6.
   - Payload for this message contains:
     - `index`: Zero-based piece index.
     - `begin`: Zero-based byte offset within the piece eg 0 for the first block, 2^14 for the second block 2*2^14 for the third block, and so on.
     - `length`: The length of the block in bytes which will be 16 * 1024 bytes for all blocks except the last block.
5. Now the client waits for the `piece` message
   - The message ID is 7
   - Payload of this message contains:
     - `index`: Zero-based piece index.
     - `begin`: Zero-based byte offset within the piece.
     - `block`: The data for the piece.
6. Once all blocks are received, they must be combined to reconstruct the entire piece. To verify the integrity, the hash of the reconstructed piece needs to be compared with the piece hash specified in the torrent file.

### Pseudocode for the process
```ruby
MESSAGE_ID_BITFIELD = 5
MESSAGE_ID_INTERESTED = 2
MESSAGE_ID_UNCHOKE = 1
MESSAGE_ID_REQUEST = 6
MESSAGE_ID_PIECE = 7
BLOCK_SIZE = 16 * 1024 # 16KiB per block

# main function with args
# index - of the piece to be downloaded
# info_dict read from the torrent file refer to the second blog to know more about torrent file structure
def main(piece_index, info_dict) 
  read_until(socket, MESSAGE_ID_BITFIELD) # Wait for the 'bitfield' message if we want we can read the payload to know which piece indexes are present in the peer in this case we assume all peers have all indexes
  send_message(socket, MESSAGE_ID_INTERESTED) # Send 'interested' message
  read_until(socket, MESSAGE_ID_UNCHOKE) # Wait for 'unchoke' message

  piece_length = info_dict['piece length']
  total_length = info_dict['length']
  num_pieces = (info_dict['pieces'].length / 20) - 1 # each piece is of length 20
  current_piece_length = piece_index < num_pieces ? piece_length : total_length - num_pieces * piece_length # calculate length of current piece

  blocks = []
  offset = 0
  while offset < current_piece_length # calculates the size of each block and prepares payload to be sent in a request message
    length = [16 * 1024, current_piece_length - offset].min
    blocks << { index: piece_index, begin: offset, length: }
    offset += length
  end
  
  blocks.each do |block| # send request message per block
    payload = [block[:index], block[:begin], block[:length]].pack('N3')
    send_message(socket, 6, payload)
  end
  
  piece_buffers = {}
  received_bytes = 0
  
  until received_bytes >= current_piece_length # listen for piece message and store the bytes in piece buffer
    message = read_message(socket)
    next if message[:id] != 7
  
    payload = message[:payload]
    index, begin_offset = payload[0, 8].unpack('N2')
    block_data = payload[8..]
    next if index != piece_index
  
    piece_buffers[begin_offset] = block_data
    received_bytes += block_data.length
  end
  
  piece_data = ''
  piece_buffers.keys.sort.each { |begin_offset| piece_data += piece_buffers[begin_offset] } # combine the bytes to for the piece

  # validate if piece hash is same as the downloaded piece hash
  expected_hash = info['pieces'].byteslice(piece_index * 20, 20)
  raise 'Piece hash mismatch' if Digest::SHA1.digest(piece_data) != expected_hash # raise error if the hashes don't match
end

def read_until(socket, id) # helper method to read until a message-id is received
  loop do
    message = read_message(socket)
    return message if message[:id] == id
  end
end

def read_message(socket) # helper method to read the data and return the message split into id and payload
  length = socket.read(4).unpack1('N') # message length
  return { id: nil, payload: nil } if length.zero?

  id = socket.read(1).unpack1('C') # convert to integer to get message id
  payload = socket.read(length - 1) # read the payload which is of length (message_length - 1)

  { id:, payload: }
end

def send_message(socket, id, payload = '') # helper method to send message
  length = [1 + payload.bytesize].pack('N')
  socket.write(length + [id].pack('C') + payload)
end
```

### Downloading an entire file
The same process can be used to download an entire file by calculating the number of pieces and sequentially downloading each piece. Once all pieces are assembled, the integrity of the file can be verified by checking its hash.

### Conclusion
In this blog, we uncovered the steps to download a piece of a file, and how this can be extended to download an entire file. For a more detailed implementation in Ruby, check out this [Github Repository](https://github.com/abhirampai/codecrafters-bittorrent-ruby/blob/master/app/tcp_connection.rb#L13).

For more information on peer messages, refer to the [BitTorrent Specification](https://www.bittorrent.org/beps/bep_0003.html#peer-messages)

In the next blog, we’ll examine how the [Magnet Links](https://www.bittorrent.org/beps/bep_0009.html) extension in BitTorrent works.

