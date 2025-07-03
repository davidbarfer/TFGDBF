# Astro Frontend

## Routes

| URL                                                            | Description                | Role Acceso              | Role Vista |
|:---------------------                                          |:----------------           |:----------------         |:---------------- |
|`/login`                                                        |Iniciar sesion              |Todos                     |Todos       |
|`/signup`                                                       |Registrarse                 |Todos                     |Todos       |
|`/asignaturas`                                                  |Ver asignaturas             |Todos                     |Todos       |
|`/asignaturas/[id]`                                             |Ver asignatura              |Todos                     |Professor/Admin/Student       |
|`/asignaturas/[id]/create`                                      |Crear práctica              |Professor/Admin           |Professor/Admin|
|`/asignaturas/[id]/grupos/create`                               |Crear grupo                 |Professor/Admin           |Professor/Admin|
|`/asignaturas/[id]/grupos/[idGrupo]`                            |Ver grupo                   |Professor/Admin/Student   |Professor/Admin/Student|
|`/practicas`                                                    |Ver entregas por prácticas  |Student/Admin             |Student/Admin|

_Role acceso: Tipo de usuario que puede acceder a la url_
_Role vista: Tipo de usuario que ven la misma o distinta vista. Si Todos se muestra para todos los roles la misma vista_
## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |