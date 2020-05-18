const SessionsService = {
    getAllSessions(knex) {
        return knex
            .select('*')
            .from('pomodoro_sessions');
    },
    getSessionsByOwnerId(knex, ownerId) {
      return knex
          .select('*')
          .from('pomodoro_sessions')
          .where({'session_owner': ownerId});
    },
    insertSession(knex, newSession) {
        return knex
            .insert({
                'session_name':`${newSession.session_name}`,
                'session_description':`${newSession.session_description}`,
                'session_owner':`${newSession.ownerId}`
            })
            .into('pomodoro_sessions')
            .returning('*')
            .then(rows => {
                return rows[0]
            });
    },
    getById(knex, id, ownerId) {
        return knex
            .from('pomodoro_sessions')
            .select('*')
            .where({'id':id, 'session_owner':ownerId})
            .first();
    },
    deleteSession(knex, id) {
        return knex('pomodoro_sessions')
            .where({id})
            .delete();
    }
};

module.exports = SessionsService;