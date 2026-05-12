# Donaciones + ClickUp (Netlify)

Proyecto listo para desplegar en Netlify y leer tareas de la lista de ClickUp `901711551904`.

## Que hace

- Lee tareas desde ClickUp usando una funcion serverless en Netlify.
- Muestra en `index.html`:
  - ID de tarea
  - Nombre de tarea
  - Campo personalizado `Monto con IVA`
- Muestra al inicio la suma total de `Monto con IVA`.
- Tiene buscador por URL o ID de tarea para ir a la fila correspondiente.

## Variables de entorno

Configura estas variables en Netlify:

- `CLICKUP_API_KEY` = tu API key/token de ClickUp
- `CLICKUP_LIST_ID` = `901711551904`

Tambien puedes copiar `.env.example` a `.env` para desarrollo local.

## Desarrollo local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Inicia Netlify Dev:

   ```bash
   npm run dev
   ```

3. Abre la URL local que muestra Netlify (normalmente `http://localhost:8888`).

## Deploy en Netlify

1. Sube este proyecto a un repo (GitHub/GitLab/Bitbucket).
2. Importa el repo en Netlify.
3. En **Site configuration > Environment variables**, agrega:
   - `CLICKUP_API_KEY`
   - `CLICKUP_LIST_ID`
4. Haz deploy.

Netlify usara la funcion en `netlify/functions/tasks.js`.
