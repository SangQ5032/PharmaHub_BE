import Branch from './branch.model.js'
class BranchRepository {
  async getAllBranches() {
    return await Branch.find()
  }
}
export default new BranchRepository()
