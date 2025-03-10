## Instalación y configuración del proyecto

### 1. Descargar el proyecto
1. Haz clic en el botón verde **Code** en este repositorio.
2. Selecciona **Download ZIP** y descarga el archivo.
3. Una vez descargado, descomprime el archivo ZIP.

### 2. Abrir el proyecto en Visual Studio Code
1. Abre Visual Studio Code.
2. Arrastra la carpeta descomprimida al editor o ábrela desde **Archivo > Abrir carpeta**.

### 3. Instalar dependencias
1. Abre una terminal en Visual Studio Code.
2. Ejecuta el siguiente comando para instalar las dependencias necesarias:
   ```sh
   npm install
   ```

### 4. Configurar variables de entorno
1. En la raíz del proyecto, crea un archivo llamado `.env`.
2. Dentro del archivo `.env`, copia y pega la siguiente configuración:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ecommerce_db
   DB_USER=tu_nombre_de_usuario  # Tu usuario de pgAdmin
   DB_PASSWORD=tu_contraseña  # Tu contraseña en pgAdmin

   JWT_SECRET=tu_secreto_jwt
   JWT_EXPIRES_IN=7d
   ```

### 5. Crear la base de datos en PostgreSQL
1. Abre **pgAdmin** o la terminal de PostgreSQL.
2. Crea una nueva base de datos con el nombre `ecommerce_db`.

### 6. Configurar la base de datos
1. Vuelve a la terminal en Visual Studio Code.
2. Ejecuta el siguiente comando para crear las tablas y poblar la base de datos:
   ```sh
   npm run db:setup
   ```

### 7. Probar el proyecto
1. vuelve a tu terminal e inicia el servidor con:
   ```sh
   nodemon server.js
   ```
2. Puedes ejecutar pruebas con:
   ```sh
   npm test
   ```
2. También puedes probar las rutas de la API utilizando **Thunder Client** o **Postman**.

