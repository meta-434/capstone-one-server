const NotesService = {
  getAllNotes(knex) {
    return knex.select("*").from("notes");
  },
  getNotesByOwnerId(knex, ownerId) {
    return knex.select("*").from("notes").where({ note_owner: ownerId });
  },
  insertNote(knex, newNote) {
    return knex
      .insert({
        note_name: `${newNote.note_name}`,
        note_content: `${newNote.note_content}`,
        note_owner: `${newNote.ownerId}`,
      })
      .into("notes")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id, ownerId) {
    return knex
      .from("notes")
      .select("*")
      .where({ id: id, note_owner: ownerId })
      .first();
  },
  deleteNote(knex, id) {
    return knex("notes").where({ id }).delete();
  },
};

module.exports = NotesService;
