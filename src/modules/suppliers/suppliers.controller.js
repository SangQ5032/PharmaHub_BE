import SupplierService from './suppliers.service.js'

class SuppliersController {
  async getAll(req, res) {
    try {
      const { page, limit, q, status, name } = req.query
      const result = await SupplierService.list({ page, limit, q, status, name })
      res.status(200).json({ success: true, ...result })
    } catch (err) {
      console.error('Get suppliers error', err)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
  async getById(req, res) {
    try {
      const { id } = req.params
      const supplier = await SupplierService.getById(id)
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found' })
      }
      res.status(200).json({ success: true, data: supplier })
    } catch (err) {
      console.error('Get supplier by ID error', err)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
  async create(req, res) {
    try {
      const data = req.body
      const newSupplier = await SupplierService.create(data)
      res.status(200).json({ success: true, data: newSupplier })
    } catch (err) {
      console.error('Create supplier error', err)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
  async update(req, res) {
    try {
      const { id } = req.params
      const data = req.body
      const updatedSupplier = await SupplierService.update(id, data)
      if (!updatedSupplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found' })
      }
      res.status(200).json({ success: true, data: updatedSupplier })
    } catch (err) {
      console.error('Update supplier error', err)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
  async delete(req, res) {
    try {
      const { id } = req.params
      const deletedSupplier = await SupplierService.delete(id)
      if (!deletedSupplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found' })
      }
      res.status(200).json({ success: true, data: deletedSupplier })
    } catch (err) {
      console.error('Delete supplier error', err)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
export default new SuppliersController()
