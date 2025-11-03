import branchService from './branch.service.js'

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
}

export default new BranchController()
