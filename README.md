# Retentio

Retentio is a churn prediction CRM for telco customers. It combines a React dashboard, an Express API, and a Flask machine learning service to help teams view customer risk, manage intervention cases, and run churn predictions.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Recharts
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Better Auth
- **ML Service:** Python, Flask, Gunicorn, XGBoost, scikit-learn, SHAP, pandas
- **Deployment:** Docker, Docker Compose, Nginx reverse proxy, GitHub Actions

## Project Structure

```text
.
├── Churn_frontend/              # React + Vite frontend
├── churn-prediction-backend/    # Express API + Prisma schema/migrations
├── churn-prediction-ml/         # Flask churn prediction service and model artifacts
├── nginx/                       # Production reverse proxy config
├── docker-compose.yml           # Production Docker Compose stack
├── .env.example                 # Example production environment variables
└── DEPLOYMENT.md                # VPS deployment guide
```

## Architecture

Nginx is the only public entrypoint.

- `http://<host>/` routes to the frontend.
- `http://<host>/api` routes to the Express backend.
- The backend calls the ML service internally through Docker networking at `http://ml-service:5000`.
- PostgreSQL and the Flask ML service are not exposed publicly.

## Local Docker Run

Create a root `.env`:

```sh
cp .env.example .env
```

For local Docker testing, use values like:

```env
BETTER_AUTH_URL=http://localhost
FRONTEND_URL=http://localhost
VITE_API_URL=/api
ML_SERVICE_URL=http://ml-service:5000
RUN_DATABASE_SEED=true
```

Start the stack:

```sh
docker compose up -d --build
docker compose ps
```

Open:

```text
http://localhost
http://localhost/api
```

Useful logs:

```sh
docker compose logs -f backend
docker compose logs -f ml-service
docker compose logs -f nginx
```

## Development Commands

Frontend:

```sh
cd Churn_frontend
npm install
npm run dev
```

Backend:

```sh
cd churn-prediction-backend
npm install
npm run dev
```

ML service:

```sh
cd churn-prediction-ml
pip install -r requirements.txt
python app.py
```

## Deployment

Production deployment targets a VPS using Docker Compose and GitHub Actions. Pushes to `main` trigger the deploy workflow.

See [DEPLOYMENT.md](DEPLOYMENT.md) for:

- VPS setup
- Required GitHub Actions secrets
- Required `.env` values
- First-time deployment
- Manual rollback and logs
- Future domain/HTTPS setup

## Notes

- Do not commit real `.env` files or private keys.
- The dataset is ignored by Git.
- The production model artifacts used by the Flask API are committed so Docker builds are reproducible.
- HTTPS is not configured yet because the current deployment uses the VPS IP directly.
