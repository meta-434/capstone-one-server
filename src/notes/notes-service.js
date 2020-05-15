const NotesService = {
    getAllNotes(knex) {
        return knex
            .select('*')
            .from('notes');
    },
    insertNote(knex, newNote) {
        return knex
            .insert({
                'note_name':`${newNote.note_name}`,
                'note_content':`${newNote.note_content}`,
                'note_owner':`${newNote.note_owner}`
            })
            .into('notes')
            .returning('*')
            .then(rows => {
                return rows[0]
            });
    },
    getById(knex, id) {
        return knex
            .from('notes')
            .select('*')
            .where('id', id)
            .first();
    },
    deleteNote(knex, id) {
        return knex('notes')
            .where({id})
            .delete();
    }
};

module.exports = NotesService;