import { createStore } from 'vuex'
import getters from './getters'
import app from './modules/app'
import api from './modules/api'
import permission from './modules/permission'
import settings from './modules/settings'
import tagsView from './modules/tagsView'
import user from './modules/user'

const store = createStore({
  modules: {
    app,
    api,
    permission,
    settings,
    tagsView,
    user
  },
  getters
})

export default store
