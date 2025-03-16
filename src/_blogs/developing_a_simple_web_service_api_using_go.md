In this blog, we will explore how to create a simple web service API using Go and the [Gin](https://gin-gonic.com/docs/) framework. We will focus on defining CRUD (Create, Read, Update, Delete) operations over an array of albums. This guide is suitable for those familiar with Go and looking to build a RESTful API.

## Setting Up the Project

### Create a New Go Project\
To begin, create a new directory for your project and navigate into it:

```sh
mkdir album-web-service
cd album-web-service
```

### Initialize the Module
Next, initialize a Go module to manage dependencies:

```sh
go mod init album-web-service
```
## Defining the Album Model

### Create the Album Struct
We will define an Album struct that represents our album data model. Create a folder called `models` and a file named `album.go`:

```sh
mkdir models
touch models/album.go
```

Open `models/album.go` and define the Album struct:

```go
// models/album.go
package models

type Album struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

var Albums = []Album{
	{ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}
```

Here, we define the Album struct with fields for ID, title, artist, and price. The JSON tags specify how these fields should be represented in JSON format.

## Implementing CRUD Operations

### Setting Up CRUD Handlers
Create a folder named `albums` and add a file called `albums.go` to handle CRUD operations:
```sh
mkdir albums
touch albums/albums.go
```

Open `albums/albums.go` and import necessary packages:
```go
// albums/albums.go
package albums

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"album_search_go_service/models"
)

```

### Get All Albums

To fetch all albums, implement the following handler:
```go
// albums/albums.go
...
func Index(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, models.Albums)
}
...
```
This function returns all albums in JSON format.

gin.Context is the most important part of Gin. It carries request details, validates and serializes JSON, and more.

[Context.IndentedJSON](https://pkg.go.dev/github.com/gin-gonic/gin#Context.IndentedJSON) to serialize the struct into JSON and add it to the response.

### Get Album by ID
To fetch an album by its ID, add this handler:

```go
// albums/albums.go
...
func Show(c *gin.Context) {
	id := c.Param("id")

	for _, album := range models.Albums {
		if album.ID == id {
			c.IndentedJSON(http.StatusOK, album)
			return
		}
	}

	c.IndentedJSON(http.StatusNotFound, gin.H{ "message": "Album not found" })
}
...
```

This function searches for an album by its ID and returns it if found; otherwise, it returns a 404 error.

### Create Album
To handle album creation, implement this handler:

```go
// albums/albums.go
func Create(c *gin.Context) {
	var newAlbum models.Album

	if err := c.BindJSON(&newAlbum); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models.Albums = append(models.Albums, newAlbum)
	c.IndentedJSON(http.StatusCreated, newAlbum)
}
```

This function binds the request body to a new album instance and appends it to the albums array.

### Update Album
To update an existing album, use this handler:
```go
// albums/albums.go
func Update(c *gin.Context) {
	id := c.Param("id")
	var updateAlbum struct {
		Title string `json:"title"`
		Artist string `json:"artist"`
		Price float64 `json:"price"`
	}

	if err := c.BindJSON(&updateAlbum); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for index, album := range models.Albums {
		if album.ID == id {
			if updateAlbum.Title != "" {
				models.Albums[index].Title = updateAlbum.Title
			}

			if updateAlbum.Artist != "" {
				models.Albums[index].Artist = updateAlbum.Artist
			}

			if updateAlbum.Price != 0 {
				models.Albums[index].Price = updateAlbum.Price
			}

			c.IndentedJSON(http.StatusOK, gin.H{ "message": "Updated album successfully", "album": models.Albums[index] })
			return
		}
	}

	c.IndentedJSON(http.StatusNotFound, gin.H{ "message": "Album not found" })
}
```

This function updates the specified fields of an existing album based on the request body.

### Show All Artists
To list all unique artists from the albums array, create another file named `artists.go` in the `albums` folder:

```go
// albums/artists.go
package artists

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"album_search_go_service/models"
)

func Index(c *gin.Context) {
	var artists = []string{}
	for	_, album := range models.Albums {
		artists = append(artists, album.Artist)
	}

	c.IndentedJSON(http.StatusOK, gin.H{ "artists": artists })
}
```
### Main Application Entry Point
Finally, create a `main.go` file that initializes Gin and sets up routes:
```go
// main.go
package main

import (
	"github.com/gin-gonic/gin"
	"album_search_go_service/albums"
	"album_search_go_service/artists"
)

func main() {
	router := gin.Default()
	router.GET("/albums", albums.Index)
	router.GET("/albums/:id", albums.Show)
	router.GET("/artists", artists.Index)
	router.POST("/albums", albums.Create)
	router.PUT("/albums/:id", albums.Update)

	router.Run("localhost:8080")
}
```

## Running the Server
To start your server, first download all required modules including Gin:
```sh
go get .
```

Then run your application:
```sh
go run .
```

## Testing the API
You can test your API using curl commands in a separate terminal window:

```sh
curl http://localhost:8080/albums

curl http://localhost:8080/albums/1

curl http://localhost:8080/albums \
    --include \
    --header "Content-Type: application/json" \
    --request "POST" \
    --data '{"id": "4","title": "The Modern Sound of Betty Carter","artist": "Betty Carter","price": 49.99}'

curl http://localhost:8080/albums/4 \
    --include \
    --header "Content-Type: application/json" \
    --request "PUT" \
    --data '{"title": "Rich Dad Poor Dad", "artist": "Robert T.Kiyosaki"}'

curl http://localhost:8080/artists
```

## Conclusion
In this blog post, we explored how to create a web service API using Go and Gin. We defined CRUD operations for managing an array of albums while demonstrating how to handle requests effectively with Gin's context management. This foundational knowledge can be expanded upon for more complex applications in the future.
