import { apiJava } from '@/lib/axios'
import { API_ENDPOINTS } from '@/lib/endpoints'
import { UserType, SignupFormValues, ProfileFormValues, AvatarImage, ChangePasswordFormValues, AddressFormValues, EmployeeProfileResponse } from '@/app/types/user.schema'
type EditProfileFormValues = ProfileFormValues
import { Client } from '@stomp/stompjs'

export class UserService {
  static async signup(userData: SignupFormValues): Promise<UserType> {
    const response = await apiJava.post<UserType>(API_ENDPOINTS.USER.SIGNUP, userData)
    return response.data
  }

  static async getProfile(userId: number): Promise<UserType> {
    const response = await apiJava.get<UserType>(API_ENDPOINTS.USER.PROFILE(userId))
    return response.data
  }

  static async saveEdit(userData: ProfileFormValues): Promise<UserType> {
    const response = await apiJava.post<UserType>(API_ENDPOINTS.USER.SAVE_EDIT, userData)
    return response.data
  }

  static async updateProfile(userData: EditProfileFormValues): Promise<UserType> {
    const response = await apiJava.post<UserType>(API_ENDPOINTS.USER.EDIT_PROFILE, userData)
    return response.data
  }

  static async changePassword(passwordData: ChangePasswordFormValues): Promise<void> {
    const response = await apiJava.post<void>(API_ENDPOINTS.USER.CHANGE_PASSWORD, passwordData)
    return response.data
  }

  static async getAddresses(): Promise<AddressFormValues[]> {
    const response = await apiJava.get<AddressFormValues[]>(API_ENDPOINTS.USER.ADDRESS)
    return response.data
  }

  static async addAddress(addressData: AddressFormValues): Promise<AddressFormValues> {
    const response = await apiJava.post<AddressFormValues>(API_ENDPOINTS.USER.ADD_ADDRESS, addressData)
    return response.data
  }

  static async updateAddress(id: number, addressData: AddressFormValues): Promise<AddressFormValues> {
    const response = await apiJava.put<AddressFormValues>(API_ENDPOINTS.USER.UPDATE_ADDRESS(id), addressData)
    return response.data
  }

  static async deleteAddress(id: number): Promise<void> {
    await apiJava.delete<void>(API_ENDPOINTS.USER.DELETE_ADDRESS(id))
  }

  static async setDefaultAddress(id: number): Promise<void> {
    await apiJava.post<void>(API_ENDPOINTS.USER.SET_DEFAULT_ADDRESS(id))
  }

  static async getAll(): Promise<UserType[]> {
    const response = await apiJava.get<UserType[]>(API_ENDPOINTS.USER.GET_ALL)
    return response.data
  }

  static async uploadAvatar(body: FormData): Promise<AvatarImage> {
    const response = await apiJava.post<AvatarImage>(API_ENDPOINTS.USER.UPLOAD_AVATAR, body, {
      headers: { 'Content-Type': undefined }
    })
    return response.data
  }

  static async getMe(): Promise<EmployeeProfileResponse> {
    const response = await apiJava.get<EmployeeProfileResponse>(API_ENDPOINTS.EMPLOYEES.ME)
    return response.data
  }

  static connectUser = (stompClient: Client, user: UserType) => {
    if (stompClient.connected) {
      stompClient.publish({
        destination: '/app/user.connectUser',
        body: JSON.stringify(user)
      })
    }
  }

  static disconnectUser = (stompClient: Client, user: UserType) => {
    if (stompClient.connected) {
      stompClient.publish({
        destination: '/app/user.disconnectUser',
        body: JSON.stringify(user)
      })
    }
  }
}
