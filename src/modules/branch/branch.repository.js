const Branch = require('./branch.model')
class BranchRepository {
  async getAllBranches() {
    return await Branch.find()
  }
}
export default new BranchRepository()
