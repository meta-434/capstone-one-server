const AuthService = {
    getAllUsers(knex) {
        return knex
            .select('*')
            .from('users');
    },
    insertUser(knex, newUser) {
        return knex
            .insert(/* TODO: FILL THIS OUT */)
            .into('users')
            .returning('*')
            .then(rows => {
                return rows[0]
            });
    },
    deleteUser(knex, username) {
        return knex('users')
            .where({username})
            .delete();
    }
}

module.exports = AuthService;