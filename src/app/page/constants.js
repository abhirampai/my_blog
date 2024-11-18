export const blogs = [
  {
    name: "How ChatGPT helped me to build a Ruby gem",
    publishedDate: "Mar 22, 2024",
    summary:
      "In my free time, I wanted to learn to create something that would benefit not only my productivity but also help in my work so I decided to create a gem that can list all deprecated methods in a ruby on rails application. And that is how I approached ChatGPT to create a gem...",
    slug: "how_chatgpt_helped_me_to_build_a_ruby_gem",
    keywords: ["chatgpt", "ruby", "rails", "gem", "unused-methods"],
  },
  {
    name: "Going ballistic with Rails upgrade",
    publishedDate: "May 24, 2024",
    summary:
      "The journey of moving from Rails 4.2 to Rails 5 was nothing short of a rollercoaster ride. This blog is all about what were the steps taken in order to achieve the changes faster and effectively so that you won’t have to face the challenges in future rails upgrades...",
    slug: "going_ballistic_with_rails_upgrade",
    keywords: ["rails upgrade", "rails5", "rails4.2", "rails-bump"],
  },
  {
    name: "Using Stimulus with Rails engine",
    publishedDate: "Nov 3, 2023",
    summary:
      "During my exploration with ruby on rails, I stumbled upon rails engine and how we can use it to encapsulate or make a ruby on rails application modular by splitting some functionality into smaller manageable sizes. So to learn more about rails engine I started off with creating a mountable rails engine...",
    slug: "using_stimulus_with_rails_engine",
    keywords: ["rails", "rails-engine", "stimulus", "mountable"],
  },
  {
    name: "Integrating Swagger with Rails and Stimulus",
    publishedDate: "Oct 25, 2024",
    summary:
      "Swagger is an api documentation UI that helps users that don’t require access to the application directly but require access to only apis can use. In many of the frameworks for example fastapi has swagger capabilities in build in it...",
    slug: "integrating_swagger_with_rails_and_stimulus",
    keywords: ["swagger", "rails", "stimulus"],
  },
  {
    name: "Integrating Scalar with Stimulus",
    publishedDate: "Oct 27, 2024",
    summary:
      "In the previous blog we saw how we can generate swagger.yaml and use it with swagger ui package. In this blog we will be looking into integrating the same swagger.yaml with Scalar. Scalar has a few features of which the one I liked the most is it shows how we can use the api with different clients like node.js, curl, etc...",
    slug: "integrating_scalar_with_stimulus",
    keywords: ["scalar", "stimulus", "rails"],
  },
  {
    name: "Enhance your Rails app with class-level callbacks",
    publishedDate: "June 19, 2024",
    summary:
      "In this blog, we will be looking into how we can enhance our rails app with class-level callbacks. Class-level callbacks are callbacks that are defined on the class level and not on the instance level. This is a great way to add callbacks to your rails app...",
    slug: "how_to_use_callback_directly_on_the_class",
    keywords: ["rails", "class-level callbacks"],
  },
  {
    name: "Using WebLlm to run AI models in browser",
    publishedDate: "Oct 29, 2024",
    summary:
      "In this blog we will be looking into using WebLlm to run ai models in browser. WebLlm is a high performance in-browser LLM inference engine that brings language model inference directly onto web browsers with hardware acceleration...",
    slug: "using_webllm_to_run_ai_models_in_browser",
    keywords: [
      "webllm",
      "llm",
      "inference",
      "AI",
      "ML",
      "Artificial Intelligence",
      "Machine Learning",
    ],
  },
  {
    name: "Create simple chat application using Github Models",
    publishedDate: "Oct 30, 2024",
    summary:
      "In this blog we will be looking into how to use github models to create a simple chat application that can generate response based on the user inputs. Also how we can keep the chatHistory so that the context is within what the user had asked the model initially...",
    slug: "using_github_models_to_create_a_chat_client_like_chatgpt",
    keywords: [
      "Github Models",
      "AI",
      "ML",
      "Artificial Intelligence",
      "Machine Learning",
      "React",
    ],
  },
  {
    name: "BitTorrent from Scratch part-0",
    summary:
      "This is the first part of a series on implementing BitTorrent from scratch. In this post, we will be looking into bencoding which is how data is communicated between peers and trackers...",
    publishedDate: "Nov 04, 2024",
    slug: "lets_implement_bittorrent_from_scratch_part_0",
    keywords: [
      "BitTorrent",
      "P2P",
      "Networking",
      "Torrent",
      "File Sharing",
      "Pseudocode",
    ],
  },
  {
    name: "BitTorrent from Scratch part-1",
    summary:
      "This blog post is the second part of a series on implementing BitTorrent from scratch. It begins by explaining the structure and contents of a torrent file, also known as a metainfo file, which includes information such as the URL of the tracker and details about the files to be distributed...",
    publishedDate: "Nov 06, 2024",
    slug: "lets_implement_bittorrent_from_scratch_part_1",
    keywords: [
      "BitTorrent",
      "torrent file",
      "metainfo file",
      "tracker",
      "tracker get request",
      "query parameters",
      "peers, interval",
      "pseudocode",
      "file distribution",
    ],
  },
  {
    name: "BitTorrent from Scratch part-2",
    summary:
    "This blog post is the third part of the series on implementing BitTorrent from scratch.It discusses about establishing tcp connection with a peer and exchanging handshake messages and finally validating the handshake message using the info hash...",
    publishedDate: "Nov 07, 2024",
    slug: "lets_implement_bittorrent_from_scratch_part_2",
    keywords: [
      "BitTorrent",
      "Peer",
      "TcpConnection",
      "Handshake",
      "Handshake validation",
    ]
  },
  {
    name: "BitTorrent from Scratch part-3",
    summary:
    "In the fourth installment of our BitTorrent series, we explore the process of downloading a file piece after completing a handshake with a peer. Key steps include waiting for a bitfield message, sending an interested message, awaiting an unchoke response, sending request message, and awaiting piece message...",
    publishedDate: "Nov 11, 2024",
    slug: "lets_implement_bittorrent_from_scratch_part_3",
    keywords: [
      "BitTorrent",
      "Peer Messages",
      "TCP connections",
      "Handshake",
      "Handshake validation",
      "Bitfield",
      "Piece",
      "File Download",
      "Hash verification",
    ]
  }, {
    name: "Understanding Magnet links",
    summary:
      "In this final part of our BitTorrent series, we explore magnet links and their use in downloading files without needing a torrent file. Magnet links are formatted as URIs that include info hashes, tracker URLs, and peer addresses to facilitate file sharing...",
    publishedDate: "Nov 13, 2024",
    slug: "understanding_magnetic_links",
    keywords: [
      "BitTorrent",
      "Magnet Links",
      "Extension Handshake",
      "Metadata Exchange",
    ]
  }, {
    name: "Apache Kafka from Scratch part-0",
    summary:
      "This blog demystifies the fundamental components of Apache Kafka, focusing on the role and function of Kafka brokers in distributed event streaming systems. Through a JavaScript example, we'll look into creating a simple Kafka broker, understand the Kafka wire protocol, and send response messages to client requests.",
    publishedDate: "Nov 18, 2024",
    slug: "apache_kafka_from_scratch_part_0",
    keywords: [
      "Apache Kafka",
      "Kafka broker",
      "Distributed system",
      "Event streaming",
      "Data pipelines"
    ]
  }
];

export const IMAGE_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOMi3OuBwADoQGA02afmgAAAABJRU5ErkJggg==";
