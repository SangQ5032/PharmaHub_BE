import Branch from './branch.model.js'
class BranchRepository {
  async getAllBranches() {
    return await Branch.find()
  }
  async createBranch(data) {
    const branch = new Branch(data)
    return await branch.save()
  }
}
export default new BranchRepository()
