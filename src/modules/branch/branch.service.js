import branchRepository from './branch.repository.js'

class BranchService {
  async getBranches() {
    const branches = await branchRepository.getAllBranches()
    return branches
  }
  async createBranch(data) {
    return await branchRepository.createBranch(data)
  }
}
export default new BranchService()
