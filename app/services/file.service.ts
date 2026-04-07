import { apiJava } from '@/lib/axios'
import { API_ENDPOINTS } from '@/lib/endpoints'
import { FileControlDetailType, FileControlType } from '../types/file.schema'

export type TmpUploadResponse = {
  success: boolean
  data: { url: string }
}

export class FileService {
  static async tmpUpload(body: FormData): Promise<TmpUploadResponse> {
    const response = await apiJava.post<TmpUploadResponse>(API_ENDPOINTS.FILES.TMP_UPLOAD, body, {
      headers: { 'Content-Type': undefined }
    })
    return response.data
  }

  static async fileDownload(body: FileControlType): Promise<FileControlDetailType> {
    const response = await apiJava.post<FileControlDetailType>(API_ENDPOINTS.FILES.DOWNLOAD, body)
    return response.data
  }
}






