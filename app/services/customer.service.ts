import { apiJava as api } from '@/lib/axios'
import type {
  Customer,
  CustomerCreateRequest,
  CustomerListParams,
  CustomerListResponse
} from '@/app/types/customer'

const PREFIX = 'customers'

export const customerService = {

  // GET /customers
  getList: (params: CustomerListParams): Promise<CustomerListResponse> =>
    api.get(PREFIX, { params }).then(res => res.data.data),

  // GET /customers/:id
  getById: (id: number | string): Promise<{ data: Customer }> =>
    api.get(`${PREFIX}/${id}`).then(res => res.data),

  // POST /customers
  create: (data: CustomerCreateRequest): Promise<{
    data: Customer
    warning?: string
  }> =>
    api.post(PREFIX, data).then(res => res.data),

  // PUT /customers/:id
  update: (id: number | string, data: Partial<CustomerCreateRequest>): Promise<{
    data: Customer
    warning?: string
  }> =>
    api.put(`${PREFIX}/${id}`, data).then(res => res.data),

  // DELETE /customers/:id (soft delete)
  deactivate: (id: number | string): Promise<{ message: string }> =>
    api.delete(`${PREFIX}/${id}`).then(res => res.data),

  // PUT /customers/:id/gps
  updateGps: (id: number | string, lat: number, lng: number) =>
    api.put(`${PREFIX}/${id}/gps`, { latitude: lat, longitude: lng }).then(res => res.data),

  // POST /customers/:id/geocode
  reGeocode: (id: number | string) =>
    api.post(`${PREFIX}/${id}/geocode`).then(res => res.data),

  // GET /customers/active-with-gps
  getActiveWithGps: (): Promise<{ data: Customer[] }> =>
    api.get(`${PREFIX}/active-with-gps`).then(res => res.data),

  // POST /customers/import
  importExcel: (file: File): Promise<{
    data: {
      success: number
      failed: number
      noGps: number
      errors: Array<{ row: number; reason: string }>
      warnings: Array<{ row: number; name: string; reason: string }>
    }
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`${PREFIX}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
  },

  // GET /customers/import/template
  downloadTemplate: () =>
    api.get(`${PREFIX}/import/template`, { responseType: 'blob' })
      .then((res: any) => {
        const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'customer_import_template.xlsx'
        a.click()
        URL.revokeObjectURL(url)
      }),
}
