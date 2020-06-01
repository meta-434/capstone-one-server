const AuthService = {
  getAllUsers(knex) {
    return knex.select("*").from("users");
  },
  getUserByUsername(knex, username) {
    return knex.select("*").from("users").where({ username });
  },
  insertUser(knex, newUser) {
    return knex
      .insert({
        username: `${newUser.username}`,
        password: `${newUser.password}`,
      })
      .into("users")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  deleteUser(knex, username) {
    return knex("users").where({ username }).delete();
  },
};

module.exports = AuthService;
