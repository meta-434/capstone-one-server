create table notes (
    id integer primary key generated by default as identity,
    note_name text not null,
    note_content text not null,
    note_owner integer references users(id) on delete cascade not null
);