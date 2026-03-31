import { apiJava } from '@/lib/axios'
import { FileControlDetailType, FileControlType } from '../types/file.schema'

export type TmpUploadResponse = {
  success: boolean
  data: { url: string }
}

export class FileService {
  static async tmpUpload(body: FormData): Promise<TmpUploadResponse> {
    const response = await apiJava.post<TmpUploadResponse>('/tmpUpload', body, {
      headers: { 'Content-Type': undefined }
    })
    return response.data
  }

  static async fileDownload(body: FileControlType): Promise<FileControlDetailType> {
    const response = await apiJava.post<FileControlDetailType>('/files/download', body)
    return response.data
  }
}
