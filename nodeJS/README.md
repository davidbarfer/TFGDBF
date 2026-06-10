# NodeJS API

## Endpoints GET

| URL                                | Description                                       |
| :--------------------------------- | :------------------------------------------------ |
| `/subjects`                        | Returns all subjects                              |
| `/subjects/user`                   | Returns all subjects of logged user               |
| `/subject/:id`                     | Returns a subject                                 |
| `/subject/:id/students`            | Returns all students of the subject               |
| `/subject/:id/practices`           | Returns all practices of the subject              |
| `/subject/:id/practice/:id/groups` | Return all groups of the practice                 |
| `/practice/:id`                    | Returns a practice                                |
| `/practice/:id/submissions`        | Returns all submissions of the practice           |
| `/group/:id`                       | Returns a group                                   |
| `/group/:id/students`              | Returns all students of the group                 |
| `/student/:id/groups`              | Returns all groups of the student                 |
| `/student/:id/submissions`         | Returns all submissions of the student            |
| `/student/:id/submission/:id`      | Returns the submission of the student             |
| `/student/:id/submission/:id/file` | Returns the file of the submission of the student |
| `/submission/:id`                  | Returns the submission                            |
| `/users`                           | Returns all users                                 |
| `/users/professors/`               | Returns all users that are professors             |

## Endpoints POST

| URL                                       | Description                               |
| :---------------------------------------- | :---------------------------------------- |
| `/login`                                  | Returns a token                           |
| `/logout`                                 | Removes the token                         |
| `/signup`                                 | Returns a user                            |
| `/subject/create`                         | Create a subject                          |
| `/subject/:id/create`                     | Create a practice for the subject         |
| `/subject/:id/practice/:id/groups/create` | Create groups for the practice            |
| `/group/:id/student/:id`                  | Add a student to a group                  |
| `/practice/:id/submissions`               | Create submissions for the practice       |
| `/practice/:id/submission/:id/edit`       | Edit a submission                         |
| `/practice/:id/group/:id/submissions`     | Create submissions for the practice group |
| `/practice/:id/evaluator/create`          | Create an evaluator for the practice      |
| `/student/:id/submission/:id/file`        | Submit a file for the student             |
| `/student/:id/submission/:id/evaluate`    | Execute an evaluator on the practice      |

## Endpoints PUT

| URL                                       | Description                               |
| :---------------------------------------- | :---------------------------------------- |
| `/student/:id/submission/:id/grade`       | Grade a student submission             |
| `/practice/:id/submissions/grade`         | Grade all submisions for the practice  |

## Endpoints DELETE

| URL                      | Description                   |
| :----------------------- | :---------------------------- |
| `/group/:id`             | Delete a group                |
| `/group/:id/student/:id` | Delete a student from a group |

## Scripts

| Command                | Action                              |
| :--------------------- | :---------------------------------- |
| `npm run lint`         | Check for linting issues            |
| `npm run lint:fix`     | Fix linting issues automatically    |
| `npm run format`       | Format code with Prettier           |
| `npm run format:check` | Check if code is properly formatted |
