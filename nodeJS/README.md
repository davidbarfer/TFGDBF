# NodeJS API

## Endpoints AUTH

| URL | Description | Method |
| :--------------------------------- | :------------------------------------------------ | :-------- |
| `auth/login`                                  | Returns a token                           | POST |
| `auth/logout`                                 | Removes the token                         | POST |
| `auth/signup`                                 | Returns a user                            | POST |

## Endpoints USERS

| URL | Description | Method |
| :--------------------------------- | :------------------------------------------------ | :-------- |
| `/users`                           | Returns all users                                 | GET |
| `/groups/:id/users`              | Returns all students of the group                 |GET |
| `/subjects/:id/users`            | Returns all students of the subject               |GET |
| `/users/current/`                  | Return current user                               |GET |
| `/users/:role/`                    | Returns all users by role                         |GET |
| `/users/:id/status`                       | Update status of a user                   |

## Endpoints SUBJECTS

| URL | Description | Method |
| :--------------------------------- | :------------------------------------------------ | :-------- |
| `/subjects/:id`                     | Returns a subject                                 | GET |
| `/subjects`                        | Returns all subjects                              | GET |
| `/subjects/users/current`                   | Returns all subjects of logged user               | GET |
| `/subjects/create`                         | Create a subject                          | POST |
| `/users/:id/subjects/:id`                   | Add a subject to a specific user          | POST |
| `/subjects/:id` | Delete a subject (LOGIC) | DELETE |

## Endpoints PRACTICES

| URL | Description | Method |
| :--------------------------------- | :------------------------------------------------ | :-------- |
| `/practices/:id`                    | Returns a practice                                | GET |
| `/subjects/:id/practices`           | Returns all practices of the subject              | GET |
| `/subjects/:id/create`                     | Create a practice for the subject         | POST |

## Endpoints GROUPS

| URL | Description | Method |
| :--------------------------------- | :------------------------------------------------ | :-------- |
| `/groups/:id`                       | Returns a group                                   | GET |
| `/users/:id/groups`              | Returns all groups of the student                 | GET |
| `/subjects/:id/practices/:id/groups` | Return all groups of the practice                 | GET |
| `/groups/:id/users/:id`                  | Add a student to a group                   | POST |
| `/groups/create`                          | Create groups for the practice            | POST |
| `/groups/:id`                             | Edit/Update a group                       | PUT |
| `/groups/:id`             | Delete a group                | DELETE |
| `/groups/:id/users/:id` | Delete a student from a group | DELETE |

## Endpoints SUBMISSIONS

| URL | Description | Method |
| :--------------------------------- | :------------------------------------------------ | :-------- |
| `/practices/:id/submissions`        | Returns all submissions of the practice           | GET |
| `/groups/:id/submissions` | Return all submissions from a practice | GET |
| `/users/:id/submissions`         | Returns all submissions of the student            | GET |
| `/users/:id/submissions/:id`      | Returns the submission of the student             | GET |
| `/users/:id/submissions/:id/file` | Returns the file of the submission of the student | GET |
| `/submissions/:id`                  | Returns the submission                            | GET |
| `/users/:id/submissions/:id/file`        | Submit a file for the student             | POST |
| `/practices/:id/submissions`               | Create submissions for the practice       | POST |
| `/practices/:id/groups/:id/submissions`     | Create submissions for the practice group | POST |
| `/practices/:id/submissions/:id/edit`       | Edit a submission                         | POST |
| `/practices/:id/evaluator/create`          | Create an evaluator for the practice      | POST |
| `/users/:id/submissions/:id/evaluate`    | Execute an evaluator on the practice      | POST |
| `/practices/:id/submissions/grade`         | Grade all submisions for the practice     | PUT |
| `/users/:id/submissions/:id/grade`       | Grade a student submission                | PUT |

## Endpoints EXPORT

| URL | Description | Method |
| :--------------------------------- | :------------------------------------------------ | :-------- |
| `/practices/:id/export`            | Returns a CSV file with grades of the practice    | GET |
| `/subjects/:id/export`             | Returns a CSV file with grades of the subject     | GET |
| `/groups/:id/export`               | Returns a CSV file with grades of the group       | GET |

## Scripts

| Command                | Action                              |
| :--------------------- | :---------------------------------- |
| `npm run dev`          | Run server in development mode      |
| `npm run prod`          | Run server in production  mode      |
| `npm run lint`         | Check for linting issues            |
| `npm run lint:fix`     | Fix linting issues automatically    |
| `npm run format`       | Format code with Prettier           |
| `npm run format:check` | Check if code is properly formatted |
