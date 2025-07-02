# NodeJS API

## Endpoints GET

### /professor/subjects

Returns all subjects of the professor.

### /professor/subject/:id

Returns a subject of the professor.

### /professor/subject/:id/students

Returns all students of the subject.

### /professor/subject/:id/practices

Returns all practices of the subject.

### /professor/subject/:id/practice/:id/groups

Return all groups of the practice.

### /users

Returns all users.

## Endpoints POST

### /login

Returns a token.

### /logout

Removes the token.

### /signup

Returns a user.

### /subject/:id/create

Create a practice for the subject.

### /subject/:id/practice/:id/groups/create

Create groups for the practice.

## Scripts

### Check for linting issues
npm run lint

### Fix linting issues automatically
npm run lint:fix

### Format code with Prettier
npm run format

### Check if code is properly formatted
npm run format:check
