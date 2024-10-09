# Tree Structure API

## Description

The **Tree Structure API** is a Node.js application built with Express.js, Sequelize ORM, and SQLite database. It provides a RESTful API for managing a hierarchical tree structure. The API supports functionalities such as retrieving nodes, adding new nodes, updating node data, deleting nodes along with their descendants, moving nodes within the tree, and changing the ordering of nodes among siblings.

This API is designed to support a frontend application that displays the tree in a collapsed state, allowing users to expand nodes as needed. It includes Swagger (OpenAPI) documentation for easy understanding and testing of the available endpoints.

---

## Table of Contents

- [Tree Structure API](#tree-structure-api)
  - [Description](#description)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Initialization](#database-initialization)
  - [Running the Application](#running-the-application)
  - [API Documentation](#api-documentation)
  - [API Endpoints](#api-endpoints)
    - [1. Retrieve a Node and Its Immediate Children](#1-retrieve-a-node-and-its-immediate-children)
    - [2. Insert a New Node](#2-insert-a-new-node)
    - [3. Update Node Data](#3-update-node-data)
    - [4. Delete a Node and Its Descendants](#4-delete-a-node-and-its-descendants)
    - [5. Move a Node to a New Parent](#5-move-a-node-to-a-new-parent)
    - [6. Change Node Ordering Among Siblings](#6-change-node-ordering-among-siblings)
  - [Swagger UI](#swagger-ui)
  - [Testing the API](#testing-the-api)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
  - [License](#license)

---

## Features

- **Retrieve nodes** and their immediate children.
- **Add new nodes** under a specified parent node.
- **Update node data**, such as the title.
- **Delete nodes** along with all their descendants.
- **Move nodes** to a different parent while preventing cycles.
- **Change the ordering** of nodes among their siblings.
- **RESTful API** design principles.
- **Swagger (OpenAPI) documentation** for interactive API exploration.
- **SQLite database** for lightweight data storage.

---

## Prerequisites

- **Node.js** (version 12 or higher)
- **npm** (Node Package Manager)
- **Git** (for cloning the repository, or you can download the ZIP)

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/tree-structure-api.git
   cd tree-structure-api
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Database Initialization

The application uses SQLite as the database. Upon the first run, it will create a `database.sqlite` file in the project root directory and initialize the necessary tables.

The application ensures that the root node with `id = 1` exists. If it doesn't, it will create one automatically.

## Running the Application

Start the server using the following command:

```bash
node app.js
```

You should see output indicating that the server is running:

```
Server is running on port 3000
```

## API Documentation

The API is documented using Swagger (OpenAPI). You can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

## API Endpoints

**Base URL:** `http://localhost:3000`

### 1. Retrieve a Node and Its Immediate Children

- **Endpoint:** `GET /nodes/{id}`
- **Description:** Retrieve a node by its ID along with its immediate children.
- **Parameters:**
  - `id` (integer, required): ID of the node to retrieve.
- **Responses:**
  - `200 OK`: Returns the node and its immediate children.
  - `404 Not Found`: Node not found.

**Example Request:**

```http
GET /nodes/1
```

**Example Response:**

```json
{
  "node": {
    "id": 1,
    "title": "Root Node",
    "parent_node_id": null,
    "ordering": 0
  },
  "children": [
    {
      "id": 2,
      "title": "Child Node",
      "parent_node_id": 1,
      "ordering": 0
    }
  ]
}
```

### 2. Insert a New Node

- **Endpoint:** `POST /nodes`
- **Description:** Inserts a new node as a child of a specified parent node.
- **Request Body:**

  ```json
  {
    "title": "New Node Title",
    "parent_node_id": 1
  }
  ```

- **Responses:**
  - `201 Created`: Node created successfully.
  - `400 Bad Request`: Parent node does not exist.

**Example Request:**

```http
POST /nodes
Content-Type: application/json

{
  "title": "New Child Node",
  "parent_node_id": 1
}
```

**Example Response:**

```json
{
  "id": 3,
  "title": "New Child Node",
  "parent_node_id": 1,
  "ordering": 1
}
```

### 3. Update Node Data

- **Endpoint:** `PUT /nodes/{id}`
- **Description:** Updates the title of the node with the specified ID.
- **Parameters:**
  - `id` (integer, required): ID of the node to update.
- **Request Body:**

  ```json
  {
    "title": "Updated Node Title"
  }
  ```

- **Responses:**
  - `200 OK`: Node updated successfully.
  - `404 Not Found`: Node not found.

**Example Request:**

```http
PUT /nodes/2
Content-Type: application/json

{
  "title": "Updated Node Title"
}
```

**Example Response:**

```json
{
  "id": 2,
  "title": "Updated Node Title",
  "parent_node_id": 1,
  "ordering": 0
}
```

### 4. Delete a Node and Its Descendants

- **Endpoint:** `DELETE /nodes/{id}`
- **Description:** Deletes the node with the specified ID and all of its descendants. Cannot delete the root node.
- **Parameters:**
  - `id` (integer, required): ID of the node to delete.
- **Responses:**
  - `200 OK`: Node and its descendants have been deleted.
  - `400 Bad Request`: Cannot delete the root node.
  - `404 Not Found`: Node not found.

**Example Request:**

```http
DELETE /nodes/2
```

**Example Response:**

```json
{
  "message": "Node and its descendants have been deleted."
}
```

### 5. Move a Node to a New Parent

- **Endpoint:** `PUT /nodes/{id}/move`
- **Description:** Moves the node with the specified ID under a new parent node. Prevents moving the node under its own descendant.
- **Parameters:**
  - `id` (integer, required): ID of the node to move.
- **Request Body:**

  ```json
  {
    "new_parent_node_id": 3
  }
  ```

- **Responses:**
  - `200 OK`: Node has been moved.
  - `400 Bad Request`: Invalid move operation.
  - `404 Not Found`: Node or new parent node not found.

**Example Request:**

```http
PUT /nodes/2/move
Content-Type: application/json

{
  "new_parent_node_id": 3
}
```

**Example Response:**

```json
{
  "message": "Node has been moved."
}
```

### 6. Change Node Ordering Among Siblings

- **Endpoint:** `PUT /nodes/{id}/reorder`
- **Description:** Changes the ordering of a node among its siblings by specifying a new ordering value.
- **Parameters:**
  - `id` (integer, required): ID of the node to reorder.
- **Request Body:**

  ```json
  {
    "new_ordering": 1
  }
  ```

- **Responses:**
  - `200 OK`: Node ordering has been updated.
  - `400 Bad Request`: Invalid new ordering value.
  - `404 Not Found`: Node not found.

**Example Request:**

```http
PUT /nodes/2/reorder
Content-Type: application/json

{
  "new_ordering": 1
}
```

**Example Response:**

```json
{
  "message": "Node ordering has been updated."
}
```

## Swagger UI

You can access the interactive Swagger UI documentation at:

```
http://localhost:3000/api-docs
```

This interface allows you to explore the API endpoints, view request and response schemas, and test the endpoints directly from the browser.

## Testing the API

You can test the API using tools like:

- **Postman**: Create requests to the API endpoints, set headers, and send payloads.
- **cURL**: Use command-line requests to interact with the API.
- **Swagger UI**: Use the "Try it out" feature to send requests directly from the documentation.

## Project Structure

```
tree-structure-api/
├── app.js
├── models/
│   └── TreeNode.js
├── routes/
│   └── treeRoutes.js
├── package.json
├── package-lock.json
├── database.sqlite
└── README.md
```

- **app.js**: The main application file that sets up the Express server, initializes the database, and configures routes and Swagger documentation.
- **models/TreeNode.js**: Defines the TreeNode Sequelize model representing nodes in the tree.
- **routes/treeRoutes.js**: Contains all the API endpoints for managing the tree structure, including Swagger comments for documentation.
- **database.sqlite**: SQLite database file generated upon running the application.
- **README.md**: Documentation and instructions for the application.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. **Fork the repository** to your own GitHub account.
2. **Clone the forked repository** to your local machine:

   ```bash
   git clone https://github.com/yourusername/tree-structure-api.git
   ```

3. **Create a new branch** for your feature or bug fix:

   ```bash
   git checkout -b feature-or-bugfix-name
   ```

4. **Make your changes** and commit them with descriptive messages.
5. **Push your changes** to your forked repository:

   ```bash
   git push origin feature-or-bugfix-name
   ```

6. **Create a pull request** from your branch to the main repository.

## License

This project is licensed under the MIT License.
