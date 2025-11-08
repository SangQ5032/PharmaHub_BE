import inventoryService from './inventory.service.js'
import mongoose from 'mongoose'

class InventoryController {
  async getAllInventory(req, res) {
    try {
      const data = await inventoryService.getAllInventory(req.query)
      return res.status(200).json({ success: true, data })
    } catch (error) {
      return res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message || 'Internal server error' })
    }
  }

  async getInventoryByBranch(req, res) {
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid branch id' })
      }
      const data = await inventoryService.getInventoryByBranch(id, req.query)
      return res.status(200).json({ success: true, data })
    } catch (error) {
      return res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message || 'Internal server error' })
    }
  }
}

export default new InventoryController()
