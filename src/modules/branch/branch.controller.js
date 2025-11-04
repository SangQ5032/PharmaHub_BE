import branchService from './branch.service.js'
import mongoose from 'mongoose'

class BranchController {
  async getAll(req, res) {
    try {
      const branches = await branchService.getBranches()
      res.status(200).json({
        success: true,
        data: branches,
      })
    } catch (error) {
      console.error('Error getting branches:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
  async getById(req, res) {
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid branch id' })
      }
      const branch = await branchService.getBranchById(id)
      if (!branch) {
        return res.status(404).json({ success: false, message: 'Branch not found' })
      }
      res.status(200).json({ success: true, data: branch })
    } catch (error) {
      console.error('Error getting branch:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export default new BranchController()
