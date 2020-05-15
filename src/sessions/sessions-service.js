const SessionsService = {
    getAllSessions(knex) {
        return knex
            .select('*')
            .from('pomodoro_sessions');
    },
    insertSession(knex, newSession) {
        return knex
            .insert({
                'session_name':`${newSession.session_name}`,
                'session_description':`${newSession.session_description}`,
                'session_owner':`${newSession.session_owner}`
            })
            .into('pomodoro_sessions')
            .returning('*')
            .then(rows => {
                return rows[0]
            });
    },
    getById(knex, id) {
        return knex
            .from('pomodoro_sessions')
            .select('*')
            .where('id', id)
            .first();
    },
    deleteSession(knex, id) {
        return knex('pomodoro_sessions')
            .where({id})
            .delete();
    }
};

module.exports = SessionsService;