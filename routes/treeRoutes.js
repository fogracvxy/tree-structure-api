// routes/treeRoutes.js
const express = require("express");

module.exports = (TreeNode) => {
  const router = express.Router();

  /**
   * @swagger
   * /nodes/{id}:
   *   get:
   *     summary: Retrieve a node and its immediate children.
   *     description: Retrieve a node by its ID along with its immediate children, ordered by 'ordering'.
   *     tags:
   *       - Nodes
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the node to retrieve.
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: A node and its immediate children.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 node:
   *                   $ref: '#/components/schemas/TreeNode'
   *                 children:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TreeNode'
   *       404:
   *         description: Node not found.
   *       500:
   *         description: Error retrieving node.
   */
  router.get("/:id", async (req, res) => {
    const nodeId = parseInt(req.params.id);

    try {
      // Find the node by ID
      const node = await TreeNode.findByPk(nodeId);

      if (!node) {
        return res.status(404).json({ error: "Node not found." });
      }

      // Find immediate children of the node
      const children = await TreeNode.findAll({
        where: { parent_node_id: nodeId },
        order: [["ordering", "ASC"]],
      });

      res.json({ node, children });
    } catch (error) {
      console.error("Error retrieving node:", error);
      res.status(500).json({ error: "Error retrieving node." });
    }
  });

  /**
   * @swagger
   * /nodes:
   *   post:
   *     summary: Insert a new node as a child of a specified parent node.
   *     description: Creates a new node under the specified parent node.
   *     tags:
   *       - Nodes
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - parent_node_id
   *             properties:
   *               title:
   *                 type: string
   *                 description: Title of the new node.
   *               parent_node_id:
   *                 type: integer
   *                 description: ID of the parent node.
   *     responses:
   *       201:
   *         description: Node created successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TreeNode'
   *       400:
   *         description: Parent node does not exist.
   *       500:
   *         description: Error inserting node.
   */
  router.post("/", async (req, res) => {
    const { title, parent_node_id } = req.body;

    try {
      // Validate that the parent node exists
      const parentNode = await TreeNode.findByPk(parent_node_id);
      if (!parentNode) {
        return res.status(400).json({ error: "Parent node does not exist." });
      }

      // Determine the next ordering value
      const siblingCount = await TreeNode.count({ where: { parent_node_id } });
      const ordering = siblingCount;

      // Create the new node
      const newNode = await TreeNode.create({
        title,
        parent_node_id,
        ordering,
      });

      res.status(201).json(newNode);
    } catch (error) {
      console.error("Error inserting node:", error);
      res.status(500).json({ error: "Error inserting node." });
    }
  });

  /**
   * @swagger
   * /nodes/{id}:
   *   put:
   *     summary: Update the data of a node.
   *     description: Updates the title of the node with the specified ID.
   *     tags:
   *       - Nodes
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the node to update.
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *             properties:
   *               title:
   *                 type: string
   *                 description: New title of the node.
   *     responses:
   *       200:
   *         description: Node updated successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TreeNode'
   *       404:
   *         description: Node not found.
   *       500:
   *         description: Error updating node.
   */
  router.put("/:id", async (req, res) => {
    const nodeId = parseInt(req.params.id);
    const { title } = req.body;

    try {
      // Find the node by ID
      const node = await TreeNode.findByPk(nodeId);

      if (!node) {
        return res.status(404).json({ error: "Node not found." });
      }

      // Update the node's title
      node.title = title;
      await node.save();

      res.json(node);
    } catch (error) {
      console.error("Error updating node:", error);
      res.status(500).json({ error: "Error updating node." });
    }
  });

  /**
   * @swagger
   * /nodes/{id}:
   *   delete:
   *     summary: Delete a node and all its descendants.
   *     description: Deletes the node with the specified ID and all of its descendants. Cannot delete the root node.
   *     tags:
   *       - Nodes
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the node to delete.
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Node and its descendants have been deleted.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Cannot delete the root node.
   *       500:
   *         description: Error deleting node.
   */
  router.delete("/:id", async (req, res) => {
    const nodeId = parseInt(req.params.id);

    // Prevent deletion of the root node
    if (nodeId === 1) {
      return res.status(400).json({ error: "Cannot delete the root node." });
    }

    try {
      // Recursive function to delete a node and its descendants
      const deleteNodeAndDescendants = async (id) => {
        // Find all child nodes
        const children = await TreeNode.findAll({
          where: { parent_node_id: id },
        });

        // Recursively delete each child node
        for (const child of children) {
          await deleteNodeAndDescendants(child.id);
        }

        // Delete the node itself
        await TreeNode.destroy({ where: { id } });
      };

      await deleteNodeAndDescendants(nodeId);

      res.json({ message: "Node and its descendants have been deleted." });
    } catch (error) {
      console.error("Error deleting node:", error);
      res.status(500).json({ error: "Error deleting node." });
    }
  });

  /**
   * @swagger
   * /nodes/{id}/move:
   *   put:
   *     summary: Move a node to a new parent node.
   *     description: Moves the node with the specified ID under a new parent node. Prevents moving the node under its own descendant.
   *     tags:
   *       - Nodes
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the node to move.
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - new_parent_node_id
   *             properties:
   *               new_parent_node_id:
   *                 type: integer
   *                 description: ID of the new parent node.
   *     responses:
   *       200:
   *         description: Node has been moved.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Cannot move the root node or move a node to its own descendant.
   *       404:
   *         description: Node or new parent node not found.
   *       500:
   *         description: Error moving node.
   */
  router.put("/:id/move", async (req, res) => {
    const nodeId = parseInt(req.params.id);
    const { new_parent_node_id } = req.body;

    try {
      // Find the node and the new parent node
      const node = await TreeNode.findByPk(nodeId);
      const newParentNode = await TreeNode.findByPk(new_parent_node_id);

      if (!node || !newParentNode) {
        return res
          .status(404)
          .json({ error: "Node or new parent node not found." });
      }

      // Prevent moving the root node
      if (nodeId === 1) {
        return res.status(400).json({ error: "Cannot move the root node." });
      }

      // Check for cycles to prevent moving a node under its own descendant
      const isDescendant = async (parentNodeId, childId) => {
        if (parentNodeId === null) return false;
        if (parentNodeId === childId) return true;
        const parent = await TreeNode.findByPk(parentNodeId);
        return await isDescendant(parent.parent_node_id, childId);
      };

      const createsCycle = await isDescendant(new_parent_node_id, nodeId);
      if (createsCycle) {
        return res
          .status(400)
          .json({ error: "Cannot move a node to its own descendant." });
      }

      // Update the node's parent_node_id
      node.parent_node_id = new_parent_node_id;

      // Determine the next ordering value in the new parent
      const siblingCount = await TreeNode.count({
        where: { parent_node_id: new_parent_node_id },
      });
      node.ordering = siblingCount;

      await node.save();

      res.json({ message: "Node has been moved." });
    } catch (error) {
      console.error("Error moving node:", error);
      res.status(500).json({ error: "Error moving node." });
    }
  });

  /**
   * @swagger
   * /nodes/{id}/reorder:
   *   put:
   *     summary: Change the ordering of a node among its siblings.
   *     description: Changes the ordering of a node among its siblings by specifying a new ordering value.
   *     tags:
   *       - Nodes
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the node to reorder.
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - new_ordering
   *             properties:
   *               new_ordering:
   *                 type: integer
   *                 description: The new ordering position among siblings.
   *     responses:
   *       200:
   *         description: Node ordering has been updated.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Invalid new ordering value.
   *       404:
   *         description: Node not found.
   *       500:
   *         description: Error changing node ordering.
   */
  router.put("/:id/reorder", async (req, res) => {
    const nodeId = parseInt(req.params.id);
    const { new_ordering } = req.body;

    try {
      // Find the node by ID
      const node = await TreeNode.findByPk(nodeId);

      if (!node) {
        return res.status(404).json({ error: "Node not found." });
      }

      // Get all sibling nodes
      const siblings = await TreeNode.findAll({
        where: {
          parent_node_id: node.parent_node_id,
        },
        order: [["ordering", "ASC"]],
      });

      if (new_ordering < 0 || new_ordering >= siblings.length) {
        return res.status(400).json({ error: "Invalid new ordering value." });
      }

      // Remove the node from its current position
      siblings.splice(node.ordering, 1);

      // Insert the node at the new position
      siblings.splice(new_ordering, 0, node);

      // Update the ordering of all siblings
      for (let i = 0; i < siblings.length; i++) {
        await TreeNode.update(
          { ordering: i },
          { where: { id: siblings[i].id } }
        );
      }

      res.json({ message: "Node ordering has been updated." });
    } catch (error) {
      console.error("Error changing node ordering:", error);
      res.status(500).json({ error: "Error changing node ordering." });
    }
  });

  // Definition of TreeNode schema
  /**
   * @swagger
   * components:
   *   schemas:
   *     TreeNode:
   *       type: object
   *       required:
   *         - id
   *         - title
   *         - ordering
   *       properties:
   *         id:
   *           type: integer
   *           description: ID of the node.
   *         title:
   *           type: string
   *           description: Title of the node.
   *         parent_node_id:
   *           type: integer
   *           nullable: true
   *           description: ID of the parent node.
   *         ordering:
   *           type: integer
   *           description: Ordering of the node among its siblings.
   *       example:
   *         id: 1
   *         title: "Root Node"
   *         parent_node_id: null
   *         ordering: 0
   */

  return router;
};
