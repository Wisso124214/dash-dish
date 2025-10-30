import DBMS from '../dbms/dbms.js';

export default class Repository {
  constructor() {
    this.dbms = new DBMS();
  }

  async getProfileIdByName(profileName) {
    const arrayProfiles = await this.dbms.query('/profiles', {
      method: 'GET',
    });
    if (arrayProfiles) {
      const profile = arrayProfiles.find((p) => p.name === profileName);
      return profile ? profile._id : null;
    }
  }

  async setUserProfile(username, profileName) {
    const users = await this.getUsersWhere({ username });
    const userId = users?.[0]?._id;
    let profileId = await this.getProfileIdByName(profileName);

    if (!profileId) {
      profileId = await this.dbms.query('/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: profileName }),
      });
    }

    if (userId && profileId) {
      await this.dbms.query(`/user_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_user: userId, id_profile: profileId }),
      });
      return true;
    }
    return false;
  }

  async getUserProfiles(username) {
    const users = await this.getUsersWhere({ username });
    const id_user = users?.[0]?._id;
    if (!id_user) {
      return null;
    }

    return await this.dbms
      .query(`/user_profiles`, {
        method: 'GET',
      })
      .then(async (userProfiles) => {
        const filteredProfiles = userProfiles.filter(
          (up) => up.id_user === id_user
        );
        return await this.dbms
          .query('/profiles', {
            method: 'GET',
          })
          .then((profiles) => {
            return filteredProfiles
              .map((up) => {
                const profile = profiles.find((p) => p._id === up.id_profile);
                return profile ? profile.name : null;
              })
              .filter((name) => name !== null);
          });
      });
  }

  async getUsersWhere(filterJson) {
    const arrayUsers = await this.dbms.query('/users', {
      method: 'GET',
    });
    if (!arrayUsers) return [];
    const keys = Object.keys(filterJson);
    const filteredUsers = arrayUsers.filter((user) =>
      keys.every((key) => user[key] === filterJson[key])
    );
    return filteredUsers;
  }
}
