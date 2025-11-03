import branchRepository from './branch.repository.js'

class BranchService {
  async getBranches() {
    const branches = await branchRepository.getAllBranches()
    return branches
  }
}

module.exports = new BranchService()
