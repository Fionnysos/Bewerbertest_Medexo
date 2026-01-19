# Bewerbertest 2026 – User Management Webapp

Technischer Bewerbertest bestehend aus:

- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB
- **Frontend:** Vue 3 + Vite + Vuetify
- **Local setup via Docker Compose**

---

## Features

- Import der Userdaten aus einer CSV in MongoDB
- Anzeige der Userdaten in einer Tabelle (Sortieren & Filtern via Vuetify)
- User **anlegen** und **bearbeiten**
- User **blockieren** und **freischalten**
- REST-basierte API

---

## Quickstart

### 1) Backend + MongoDB starten

```bash
cd Backend
npm install
docker compose up --build
````

Das Backend läuft anschließend unter:

* [http://localhost:4001](http://localhost:4001)

MongoDB ist lokal erreichbar unter:

* `localhost:35555` (Container Port 27017)

---

### 2) CSV Import ausführen (Backend)

Import Endpoint:

```http
POST /v1/users/import
```

PowerShell Beispiel:

```powershell
irm -Method Post http://localhost:4001/v1/users/import
```

> **Hinweis:**
> Die Datei `user.csv` wird im Backend-Container unter `/app/user.csv` erwartet.
> Die CSV ist über Docker Compose als Volume in den Container gemountet.

---

### 3) Frontend starten

```bash
cd Frontend
npm install
docker compose up --build
```

Frontend erreichbar unter:

* [http://localhost:5001](http://localhost:5001)

---

## Environment / Configuration

### Frontend API Base URL

Die API Base URL wird im Frontend über eine `.env` Datei gesetzt:

```env
VITE_API_BASE=http://localhost:4001/v1
```

---

## API Endpoints

Base URL: `http://localhost:4001/v1`

### Users

* `GET /users`
  Listet alle User (wird für die Tabelle im Frontend genutzt)

* `POST /users`
  Erstellt einen neuen User

* `PATCH /users/:id`
  Aktualisiert Felder eines Users

* `PATCH /users/:id/block`
  Blockiert einen User (`blocked = true`)

* `PATCH /users/:id/unblock`
  Hebt die Blockierung auf (`blocked = false`)

### CSV Import

* `POST /users/import`
  Importiert User aus einer CSV-Datei
  (Upsert-Logik, E-Mail-Adresse ist eindeutig)

---

## Project Structure

```text
Bewerbertest2026
├── Backend
│   ├── app.js                # Express App (middlewares + routes), testbar
│   ├── index.js              # Startup: DB connect + app.listen
│   ├── service
│   │   └── routes
│   │       └── user.js
│   ├── entity
│   │   └── UserModel.js
│   ├── test
│   │   ├── jest.setup.js
│   │   └── user.test.js
│   ├── docker-compose.yml
│   └── Dockerfile.dev
│
├── Frontend
│   ├── app
│   │   └── src
│   │       ├── components
│   │       │   └── UsersTable.vue
│   │       └── api.js
│   ├── docker-compose.yml
│   └── Dockerfile.dev
│
├── user.csv
└── README.md
```

---

## Tests (Backend)

### Testing Strategy

Für Tests wird die Express-App aus `app.js` importiert, ohne einen echten Server
(`app.listen`) zu starten. Dadurch können API-Endpunkte isoliert getestet werden.

MongoDB wird während der Tests über eine **In-Memory-Instanz** bereitgestellt
(`mongodb-memory-server`).
So sind Tests:

* reproduzierbar
* unabhängig von Docker
* frei von Seiteneffekten

### Tests ausführen

```bash
cd Backend
npm test
```

Verwendete Technologien:

* **Jest** – Test Runner
* **Supertest** – HTTP Requests gegen die Express App
* **mongodb-memory-server** – MongoDB im RAM

---

## Notes / Improvements for Production

