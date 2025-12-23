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
  async create(req, res) {
    try {
      const { name, address, phone, revenue_target, location } = req.body
      if (!name || !address || !phone) {
        return res
          .status(400)
          .json({ success: false, message: 'name, address and phone are required' })
      }
      const newBranch = await branchService.createBranch({
        name,
        address,
        phone,
        revenue_target,
        location,
      })
      res.status(201).json({ success: true, message: 'Tạo chi nhánh thành công', data: newBranch })
    } catch (error) {
      console.error('Error creating branch:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
  async update(req, res) {
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid branch id' })
      }
      const updated = await branchService.updateBranch(id, req.body)
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Branch not found' })
      }
      res.status(200).json({ success: true, data: updated })
    } catch (error) {
      console.error('Error updating branch:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
  async delete(req, res) {
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid branch id' })
      }
      const deleted = await branchService.deleteBranch(id)
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Branch not found' })
      }
      res.status(200).json({ success: true, message: 'Branch deleted' })
    } catch (error) {
      console.error('Error deleting branch:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
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
  async close(req, res) {
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid branch id' })
      }
      const branch = await branchService.closeBranch(id)
      if (!branch) {
        return res.status(404).json({ success: false, message: 'Branch not found' })
      }
      res
        .status(200)
        .json({ success: true, message: 'Đóng cửa chi nhánh thành công', data: branch })
    } catch (error) {
      console.error('Error closing branch:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
  async open(req, res) {
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid branch id' })
      }
      const branch = await branchService.openBranch(id)
      if (!branch) {
        return res.status(404).json({ success: false, message: 'Branch not found' })
      }
      res.status(200).json({ success: true, message: 'Mở cửa chi nhánh thành công', data: branch })
    } catch (error) {
      console.error('Error opening branch:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export default new BranchController()
