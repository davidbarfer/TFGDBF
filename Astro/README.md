# Astro Frontend

## Routes

| URL                                                            | Description         | Role |
|:---------------------                                          |:------------       |:-----|
|`/login`                                                        |Iniciar sesion      |Todos|
|`/signup`                                                       |Registrarse         |Todos|
|`/asignaturas`                                                  |Ver asignaturas     |Professor/Admin|
|`/asignaturas/[id]`                                             |Ver asignatura      |Professor/Admin|
|`/asignaturas/[id]/create`                                      |Crear práctica      |Professor/Admin|
|`/asignaturas/[id]/grupos/create`                               |Crear grupo         |Professor/Admin|
|`/asignaturas/[id]/grupos/[idGrupo]`                            |Ver grupo           |Professor/Admin|
|`/practicas`                                                    |Ver prácticas       |Student/Admin|

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