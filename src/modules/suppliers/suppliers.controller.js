import { SupplierRepository } from './suppliers.repository.js'
import SupplierService from './suppliers.service.js'

class SuppliersController {
  async getAll(req, res) {
    try {
      const { page, limit, q, status } = req.query
      const result = await SupplierService.list({ page, limit, q, status })
      res.status(200).json({ success: true, ...result })
    } catch (err) {
      console.error('Get suppliers error', err)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
export default new SuppliersController()
