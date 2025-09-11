import { defineStore } from 'pinia'
import type { userState } from '@/stores/types'
import { DEFAULT_PERMISSIONS } from '@/utils/permission'

export const useUserStore = defineStore('user', {
  state: (): userState => ({
    superUser: false,
    userID: -1,
    userName: '',
    avatar: '',
    level: 1,
    permissions: DEFAULT_PERMISSIONS,
    wizard: false,
  }),

  // 全局持久化
  persist: true,

  actions: {
    setSuperUser(superUser: boolean) {
      this.superUser = superUser
    },
    setUserID(userID: number) {
      this.userID = userID
    },
    setUserName(userName: string) {
      this.userName = userName
    },
    setAvatar(avatar: string) {
      this.avatar = avatar
    },
    setLevel(level: number) {
      this.level = level
    },
    setPermissions(permissions: object) {
      this.permissions = { ...DEFAULT_PERMISSIONS, ...permissions }
    },
    setWizard(wizard: boolean) {
      this.wizard = wizard
    },
    loginUser(payload: userState) {
      this.setSuperUser(payload.superUser)
      this.setUserID(payload.userID)
      this.setUserName(payload.userName)
      this.setAvatar(payload.avatar)
      this.setLevel(payload.level)
      this.setPermissions(payload.permissions)
      this.setWizard(payload.wizard)
    },
    reset() {
      this.setSuperUser(false)
      this.setUserID(-1)
      this.setUserName('')
      this.setAvatar('')
      this.setLevel(1)
      this.setPermissions(DEFAULT_PERMISSIONS)
      this.setWizard(false)
    },
  },

  getters: {
    getSuperUser: state => state.superUser,
    getUserID: state => state.userID,
    getUserName: state => state.userName,
    getAvatar: state => state.avatar,
    getLevel: state => state.level,
    getPermissions: state => state.permissions,
    getWizard: state => state.wizard,
  },
})
