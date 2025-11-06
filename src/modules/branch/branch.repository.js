import Branch from './branch.model.js'
class BranchRepository {
  async getAllBranches() {
    return await Branch.find()
  }
  async createBranch(data) {
    const branch = new Branch(data)
    return await branch.save()
  }
  async updateBranch(id, data) {
    return await Branch.findByIdAndUpdate(id, data, { new: true })
  }
  async deleteBranch(id) {
    return await Branch.findByIdAndDelete(id)
  }
  async getBranchById(id) {
    return await Branch.findById(id)
  }
}
export default new BranchRepository()
