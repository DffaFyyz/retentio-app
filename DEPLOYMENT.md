# Retentio Production Deployment

This deployment runs Retentio as one monorepo on a VPS using Docker Compose.

- Public entrypoint: Nginx on `http://103.152.242.177`
- Frontend: React/Vite static app at `/`
- Backend: Express API behind Nginx at `/api`
- ML service: Flask/Gunicorn on the internal Docker network only
- Database: PostgreSQL on the internal Docker network only

HTTPS is intentionally not configured yet because there is no domain.

## Repository Layout

The VPS app directory should be a clone of this monorepo:

```sh
/home/daffa/apps/retentio
├── docker-compose.yml
├── .env
├── nginx/conf.d/default.conf
├── Churn_frontend
├── churn-prediction-backend
└── churn-prediction-ml
```

The ML training dataset is ignored by Git. The Flask API model artifacts are committed because they are required for production image builds:

```text
churn-prediction-ml/model_features.pkl
churn-prediction-ml/xgboost_churn_model.pkl
churn-prediction-ml/artifacts/
```

## VPS Preparation

Install Docker, Docker Compose, Git, and allow HTTP:

```sh
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc >/dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker daffa
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

Log out and back in after adding `daffa` to the Docker group.

Clone the monorepo:

```sh
mkdir -p /home/daffa/apps
cd /home/daffa/apps
git clone <monorepo-url> retentio
cd retentio
```

## Required `.env`

Create `/home/daffa/apps/retentio/.env` from `.env.example`:

```sh
cp .env.example .env
nano .env
```

Required values:

```sh
NODE_ENV=production
POSTGRES_USER=retentio
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=retentio
DATABASE_URL=postgresql://retentio:<strong-password>@postgres:5432/retentio?schema=public
RUN_DATABASE_SEED=false
BETTER_AUTH_SECRET=<long-random-secret>
BETTER_AUTH_URL=http://103.152.242.177
FRONTEND_URL=http://103.152.242.177
ML_SERVICE_URL=http://ml-service:5000
ML_MODEL_VERSION=xgboost_churn_model
ML_RISK_THRESHOLD=0.59
VITE_API_URL=/api
```

Docker Compose constructs the backend container `DATABASE_URL` from `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`, so the app connects to `postgres:5432` inside Docker. Keep `DATABASE_URL` for Prisma commands you run outside Docker.

Set `RUN_DATABASE_SEED=true` only when you want the backend startup to seed or refresh the synthetic demo data. The seed script uses upserts, so it is repeatable, but production normally leaves this as `false`.

Do not commit the real `.env`.

## Required GitHub Secrets

Add these repository secrets in the monorepo GitHub repository:

```text
VPS_HOST=103.152.242.177
VPS_USER=daffa
VPS_SSH_KEY=<private ssh key>
VPS_PORT=22
APP_DIR=/home/daffa/apps/retentio
```

The matching public key must be in `/home/daffa/.ssh/authorized_keys` on the VPS.

## First-Time Deployment

From the VPS:

```sh
cd /home/daffa/apps/retentio
docker compose up -d --build
docker compose ps
```

The backend container runs `prisma migrate deploy` before starting Express. If `RUN_DATABASE_SEED=true`, it also runs `npm run prisma:seed`. PostgreSQL data is stored in the named Docker volume `retentio_postgres_data`.

Open:

```text
http://103.152.242.177
http://103.152.242.177/api
```

## Manual Operations

Deploy manually:

```sh
cd /home/daffa/apps/retentio
git fetch origin main
git reset --hard origin/main
docker compose up -d --build
docker image prune -f
docker compose ps
```

Check logs:

```sh
docker compose logs -f backend
docker compose logs -f ml-service
docker compose logs -f nginx
docker compose logs -f postgres
```

Restart services:

```sh
docker compose restart backend
docker compose restart ml-service
docker compose restart nginx
```

Update environment variables:

```sh
cd /home/daffa/apps/retentio
nano .env
docker compose up -d --build
```

Rollback manually:

```sh
cd /home/daffa/apps/retentio
git log --oneline -5
git reset --hard <commit-sha>
docker compose up -d --build
```

## Domain and HTTPS Later

After a domain points to `103.152.242.177`:

1. Update `.env`:
   ```sh
   BETTER_AUTH_URL=https://your-domain.com
   FRONTEND_URL=https://your-domain.com
   ```
2. Change `server_name _;` in `nginx/conf.d/default.conf` to your domain.
3. Install Certbot on the VPS and issue a certificate for the domain.
4. Add an HTTPS server block and redirect HTTP to HTTPS.
5. Run:
   ```sh
   docker compose up -d
   ```

## Safety Notes

- Only `nginx` publishes a host port: `80:80`.
- `backend`, `frontend`, `ml-service`, and `postgres` only expose internal Docker ports.
- Nginx routes `/` to the frontend and `/api` to Express.
- There is no public `/ml` route.
- Express calls Flask through `ML_SERVICE_URL=http://ml-service:5000`.
- The Vite frontend defaults to `/api`, so production does not call `localhost`.
- GitHub Actions deploy only on pushes to `main`.
