# Pomodoro Server

This is the server for the Pomodoro App client, found here `https://github.com/meta-434/capstone-one-client`

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone BOILERPLATE-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Install the node dependencies `npm install`
4. Update the `.env` file with a `PORT`, your `SECRET_KEY` for authentication key generation, your `DATABASE_URL`, and optionally, a `TEST_DATABASE_URL`.
5. Run `yarn run migrate` without any parameters to create your database.
6. Run the SQL scripts in /seeds on your postgres database to provide test data.
7. Run `yarn run dev` to start the nodemon server.

## Scripts

Start the application `yarn run dev`

Run migration SQL scripts `npm run migrate`

Run the tests `yarn run test`

## Tech
+ Express
+ JWT
