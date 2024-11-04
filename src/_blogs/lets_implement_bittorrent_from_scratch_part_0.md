Most of us at some point in life might have used BitTorrent and downloaded movies, games, etc. [BitTorrent](https://www.bittorrent.com/) is a peer-to-peer file-sharing communication protocol through which users can distribute data and files in a decentralized manner.

Before diving further into the blog let me share about [codecrafters](codecrafters.io) from where I got to implement and understand more about BitTorrent. You can checkout their BitTorrent course here https://app.codecrafters.io/courses/bittorrent.

In this blog let's just look into how BitTorrent works like what is the BitTorrent protocol and also try to form a pseudocode for it. Let's look into different terminology that we might come across during the course of these blogs first.

- Tracker -> Trackers are servers that assist communication between peers while sharing files
- Peer -> Refers to the number of users that have the file and are seeding. If the torrent file has a healthy number of peers, it should result in faster and more reliable file transfer and a quality streaming experience
- Bencode -> Bencode is the serialization format used in torrent files for communication between trackers and peers.

Now let's first check what the Bencode format, basically Bencode supports 4 data types:
- Strings
- Integers
- Arrays
- Dictionaries

Strings -> are encoded as `<length>:<contents>` for example `5:apple` decoded as `'apple'`.

Integers -> are encoded as `i<number>e` for example `i36e` is decoded as `'36'`.

Arrays -> are encoded as `l<bencoded_elements>e` for example `l5:applei36ee` is decoded as `['apple', 36]`. An array can have any bencoded string as its content.

Dictionaries -> are encoded as `d<key><value>e` for example `d5:mango5:apple5:orangei25ee` decoded as `{ 'mango': 'apple', 'orange': 25 }`. Keys are strings and are sorted when encoded i.e, if orange is first key in the dictionary, it would still be coming after the mango in the encoded string.

### Psuedocode for decoding bencoded strings

Decoding a bencoded string:
1. First we set a few variables:
```
final_result # We can set it as an array initially
current_index # We set it to 0 initially
total_length # Set it as the total length of the bencoded string
```

2. Next let's check what the first character of the string
```
if current_index > total_length goto step 6
case 1 -> "l" decoding array -> goto step 3
case 2 -> "d" decoding dictionary -> goto step 3 but store the result as a hash
case 3 -> "i" decoding integer -> goto step 4
case 4 -> "/d" which is regex corresponding to integers, so its decoding strings -> goto step 5
case 5 -> "e" which is a terminating character so return the final_result and current_index
Any other character throw an exception that its unsupported.
```

3. Inside the array there could be any number of bencoded string types
```
Increase current_index by 1.
Goto step 2 and get the decoded results and the end_index.
Add end_index + 1 to current_index.
Append the decoded results to the final_result.
```

4. To decode an integer find the index of adjacent e.
```
Increase current_index by 1.
Get the index of 'e' to current_index and store it as index_of_e.
Now the integer is bencoded_string from current_index to index_of_e.
Return the integer and index_of_e + 1
```

5. To decode the string we just have to skip the 'length' and ':' and read length number of characters to get the encoded string.
```
Store length of the string as 'length_of_string'
Find the index of ':' to current_index and store it as colon_index.
Set current_index as colon_index + 1.
Now the decoded string would be bencoded_string from current_index to current_index + length_of_string.
Now add length_of_string to current_index.
Return the decoded string and current_index.
```

6. Now we are out of the loop lets return the result, i.e final_result.

### Psuedocode for bencoding strings
This is fairly easier since we just have to check the type of the data and return proper format.


1. Check for the data type for the data ( lets assume data variable holds the string to be encoded ).
```
case 1 -> String, goto step 2.
case 2 -> Integer, goto step 3.
case 3 -> Array, goto step 4.
case 4 -> Dictionary, goto step 5.
Any other types throw unsupported type exception.
```

2. Strings
```
return {data.length}:{data}
```

3. Integers
```
return i{data}e
```

4. Arrays
```
for each item get the encoded string then store it to a string encoded_array

return l{encoded_array}e
```

5. Dictionaries
```
here we need to sort the keys and then get the encoded strings for each key value pair,
sort the hash/object by keys then for each of the key and value encode them and them join all of them as a string as encoded_dict

return d{encoded_dict}e
```

Phew that was lot of pseudo code for a blog I believe. So lets just keep this blog to bencoding concept, so in this blog we just saw different data types supported by the bittorrents bencode serialization format.

If you want to know more on bencode visit https://www.bittorrent.org/beps/bep_0003.html#bencoding.

You can find a sample implementation of bencoding using ruby @ https://github.com/abhirampai/codecrafters-bittorrent-ruby/blob/master/app/bencoding.rb.

We will continue to look into more of the BitTorrent concepts in upcoming blogs.
