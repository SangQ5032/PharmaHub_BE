import branchRepository from './branch.repository.js'

class BranchService {
  async getBranches() {
    const branches = await branchRepository.getAllBranches()
    return branches
  }
  async createBranch(data) {
    return await branchRepository.createBranch(data)
  }
  async updateBranch(id, data) {
    return await branchRepository.updateBranch(id, data)
  }
  async deleteBranch(id) {
    return await branchRepository.deleteBranch(id)
  }
  async getBranchById(id) {
    return await branchRepository.getBranchById(id)
  }
}
export default new BranchService()
