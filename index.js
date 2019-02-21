const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)

const Plugin = require('@midgar/midgar/plugin')

/**
 * MidgarSequelizeSession plugin
 * 
 * Add sequelize session storage
 */
class MidgarSequelizeSession extends Plugin {
  /**
   * Init plugin
   */
  async init() {
    this.pm.on('afterLoadPlugins', () => {
      return this._afterLoadPlugins()
    })
  }

  /**
   * afterLoadPlugins callback
   * 
   * Add the sequelize session store
   */
  async _afterLoadPlugins() {
    //get session plugin
    const sessionPlugin = this.pm.plugins['@midgar/session']

    //add sequelise store
    await sessionPlugin.addStore('sequelize', async (midgar) => {
      //if the db is install return sequelize store
      if (midgar.services.db.installed) {

        return new SequelizeStore({
          db: midgar.services.db,
          table: 'session',
          checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
          expiration: 24 * 60 * 60 * 1000,  // The maximum age (in milliseconds) of a valid session.
          extendDefaultFields: function (defaults, session) {
            return {
              data: defaults.data,
              expires: defaults.expires,
              user_id: session.user ? session.user.id : null,
            }
          },
        })
        //else return null to use default store
      } else {
        return null
      }
    })
  }
}

module.exports = MidgarSequelizeSession
