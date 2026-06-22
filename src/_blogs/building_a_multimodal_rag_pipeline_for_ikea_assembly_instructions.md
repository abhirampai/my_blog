Retrieval-Augmented Generation (RAG) is commonly demonstrated using text-heavy documents such as manuals, knowledge bases, or PDFs. However, many real-world documents are highly visual and contain very little text.

IKEA assembly instructions are a great example. Most pages consist of diagrams, part numbers, arrows, and assembly sequences rather than paragraphs of written instructions. Traditional text extraction approaches struggle to capture this information effectively.

In this article, we'll build a multimodal RAG pipeline capable of answering questions about IKEA furniture assembly. The system converts assembly manuals into images, uses a vision model to generate detailed page descriptions, stores semantic embeddings in a vector database, and retrieves relevant instruction pages to answer user questions.

By the end, we'll have an AI assistant capable of answering questions such as:

* How do I attach the legs to the desk?
* Which screws are required for this step?
* What tools are needed for assembly?
* Where does a specific part belong?

We'll use:

* **Ollama** for local inference
* **Gemma 4** for vision and question answering
* **EmbeddingGemma** for embeddings
* **ChromaDB** as the vector database
* **pdf2image** for PDF processing

---

# Architecture Overview

The complete workflow looks like this:

```text
IKEA PDFs
    │
    ▼
PDF → Images
    │
    ▼
Vision Model
(Page Descriptions)
    │
    ▼
Embeddings
    │
    ▼
ChromaDB
    │
User Query
    │
    ▼
Embedding Model
    │
    ▼
Similarity Search
    │
    ▼
Relevant Pages
    │
    ▼
Vision LLM
    │
    ▼
Answer
```

Unlike traditional RAG systems that rely on extracted text, this approach uses a vision model to understand assembly diagrams and convert them into searchable semantic descriptions.

---

# Step 1: Setting Up the Data

The first step is collecting the IKEA assembly manuals that will form our knowledge base.

For this example, we'll use a small collection of IKEA assembly instructions.

```python
IKEA_ASSEMBLY_INSTRUCTIONS = {
    'billy_bookcase.pdf': 'https://www.ikea.com/us/en/assembly_instructions/billy-bookcase-white__AA-2289108-3-100.pdf',
    'billy_desk.pdf': 'https://www.ikea.com/us/en/assembly_instructions/billy-desk-white__AA-2402639-4-100.pdf',
    'malm_bed_frame.pdf': 'https://www.ikea.com/us/en/assembly_instructions/malm-bed-frame-white__AA-837114-9-100.pdf',
    'malm_desk.pdf': 'https://www.ikea.com/us/en/assembly_instructions/malm-desk-white__AA-516949-7-2.pdf',
    'pax_wardrobe_frame.pdf': 'https://www.ikea.com/ie/en/assembly_instructions/pax-wardrobe-frame-white__AA-1289393-10-100.pdf'
}
```

Before downloading the manuals, let's create the required directory structure.

```python
import os
import requests

for d in ['data', 'data/images', 'data/cache']:
    os.makedirs(d, exist_ok=True)

print('Created directories')
```

Next, download each PDF.

```python
for filename, url in IKEA_ASSEMBLY_INSTRUCTIONS.items():
    filepath = f"data/{filename}"

    if not os.path.exists(filepath):
        print(f"Downloading assembly instruction {filename}...")

        response = requests.get(url, timeout=30)
        assembly_instruction_content = response.content

        with open(filepath, 'wb') as f:
            f.write(assembly_instruction_content)

        print(
            f"Saved {filename} "
            f"({len(assembly_instruction_content)/1024:.1f} KB)"
        )
    else:
        print(f"{filename} already exists")
```

At this point, we have all assembly manuals stored locally and ready for processing.

---

# Step 2: Preprocessing the Data

A typical PDF RAG pipeline extracts text directly from PDFs and embeds that text.

Unfortunately, IKEA manuals contain very little machine-readable text. Most of the valuable information is embedded inside:

* Assembly diagrams
* Visual instructions
* Part numbers
* Directional arrows
* Tool indicators
* Warnings

Because of this, we take a different approach.

Instead of extracting text, we convert each PDF page into an image and ask a vision model to generate a detailed description of what it sees.

These descriptions will later become our searchable knowledge base.

## Converting PDFs to Images

```python
from pdf2image import convert_from_path

def convert_pdf_to_images(pdf_path):
    pdf_name = os.path.splitext(
        os.path.basename(pdf_path)
    )[0]

    images = convert_from_path(
        pdf_path,
        dpi=150
    )

    image_paths = []

    for i, image in enumerate(images):
        image_path = (
            f"{IMAGES_DIR}/"
            f"{pdf_name}_page{i+1:03d}.png"
        )

        image.save(image_path, "PNG")
        image_paths.append(image_path)

    return image_paths
```

## Generating Semantic Page Descriptions

We use Gemma 4 Vision to describe each instruction page.

```python
VISION_INSTRUCTION = """
Describe this IKEA assembly instruction page in detail.

Include:
- Step numbers
- Parts shown
- Tools required
- Actions demonstrated
- Quantities
- Warnings
- Part numbers if visible

This description will help people find
this page when they have questions.
"""
```

The vision model processes each page image and generates a detailed textual representation.

```python
def describe_page(image_path):
    with open(image_path, 'rb') as f:
        base64_image = base64.b64encode(
            f.read()
        ).decode('utf-8')

        response = chat(
            model='gemma4:e2b',
            messages=[
                {
                    'role': 'system',
                    'content': VISION_INSTRUCTION
                },
                {
                    'role': 'user',
                    'images': [base64_image]
                }
            ]
        )

    return response.message.content
```

To avoid repeatedly generating descriptions for the same page, we cache results locally.

This significantly speeds up experimentation and reduces inference costs.

---

# Step 3: Generating Embeddings and Building the Index

Once every page has a detailed description, we can transform those descriptions into embeddings.

Embeddings are numerical representations of semantic meaning.

For example:

```text
Attach the desk legs using screws

Fasten the support legs to the frame
```

Although these sentences use different words, they describe similar actions and therefore produce similar embeddings.

## Creating Embeddings

```python
from ollama import embed

def get_embedding(text):
    response = embed(
        model="embeddinggemma",
        input=text
    )

    return response["embeddings"]
```

## Storing Embeddings in ChromaDB

We use ChromaDB as our vector store.

```python
collection = chroma_client.create_collection(
    name=COLLECTION_NAME,
    metadata={
        'hnsw:space': 'cosine'
    }
)
```

ChromaDB uses an HNSW (Hierarchical Navigable Small World) index, allowing efficient similarity searches even as the dataset grows.

Each page description is stored alongside useful metadata.

```python
collection.add(
    ids=[f"page_{i}"],
    embeddings=embedding,
    documents=[page['description']],
    metadatas=[{
        'source_pdf': page['source_pdf'],
        'page_number': page['page_number'],
        'image_path': page['image_path']
    }]
)
```

This metadata later helps us identify exactly which instruction pages were used to answer a question.

---

# Step 4: Constructing the RAG Pipeline

Now that our vector database is ready, we can build the actual retrieval pipeline.

The process consists of four stages:

1. Receive a user query
2. Generate an embedding for that query
3. Retrieve the most relevant instruction pages
4. Generate an answer using those pages

## Retrieval

```python
def retrieve(query, top_k=3):
    collection = chroma_client.get_collection(
        name=COLLECTION_NAME
    )

    query_embedding = get_embedding(query)

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
        include=[
            'documents',
            'metadatas'
        ]
    )

    return results
```

## Why Use the Original Images?

One interesting design choice is that we don't pass the generated descriptions to the answering model.

Instead, we pass the original page images.

This allows the vision model to directly inspect the instruction diagrams and produce a more accurate answer.

## Generating Answers

```python
response = chat(
    model='gemma4:e2b',
    messages=[
        {
            'role': 'system',
            'content': """
            You answer questions about IKEA
            assembly based on instruction pages.

            Be specific and reference page
            numbers when helpful.
            """
        },
        {
            'role': 'user',
            'content': f"Question: {query}"
        }
    ]
)
```

The retrieved images serve as grounding context, helping reduce hallucinations and improving answer quality.

---

# Example Query

Suppose a user asks:

```text
How do I attach the legs to the desk?
```

The retrieval stage identifies the most relevant assembly pages and passes them to the vision model.

The generated answer may look something like:

```text
Based on the retrieved instruction pages:

1. Attach the side support brackets to the frame.
2. Align the desk legs with the support structure.
3. Secure the legs using the specified hardware.
4. Tighten all fasteners before continuing assembly.

Refer to Page 16 and Page 18 of the Billy Desk
instructions for the detailed assembly sequence.
```

Because the answer is generated using actual instruction pages, it remains grounded in the source material.

---

# Limitations

While the system works surprisingly well, there are several limitations.

### Vision Description Quality

The retrieval quality depends heavily on the quality of generated page descriptions.

If the vision model misses an important component or label, retrieval performance can suffer.

### Page-Level Retrieval

We currently retrieve entire pages rather than individual assembly steps.

More granular retrieval could improve precision.

### No Reranking

The pipeline retrieves the nearest neighbors directly from ChromaDB.

Adding a reranker model could improve retrieval quality.

### Similar-Looking Pages

Assembly manuals often contain visually similar pages, which can occasionally confuse retrieval.

---

# Conclusion

In this project, we built a multimodal RAG pipeline capable of answering questions about IKEA assembly instructions.

Instead of relying solely on text extraction, we converted PDF pages into images and used a vision model to generate detailed descriptions. These descriptions were embedded, indexed in ChromaDB, and retrieved during question answering. The retrieved instruction pages were then provided back to a vision-language model to generate grounded responses.

While this is a relatively simple implementation, it demonstrates an important idea: many real-world knowledge sources are visual rather than textual. By combining vision models, embeddings, vector search, and retrieval-augmented generation, we can build systems that make complex visual documents searchable and conversational.

The same architecture can be extended beyond IKEA manuals to equipment guides, engineering diagrams, maintenance manuals, medical documents, and other visually rich sources where traditional text-based RAG systems struggle.

---

# References
[Datacamp Multimodal RAG Tutorial](https://www.datacamp.com/tutorial/multimodal-rag)