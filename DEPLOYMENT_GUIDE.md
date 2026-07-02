# Deployment Guide - Phintra Platform

This guide provides instructions for deploying Phintra to local containers and enterprise cloud environments (AWS & Azure).

---

## 1. Local Docker Deployment (Phase 8 Reference)

### Prerequisites
Create a `.env` file in the root workspace folder matching the required parameters:
```env
DB_PASSWORD=mysecurepostgrespassword
SECRET_KEY=mycryptographicallysecurerandom32bytekey
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=myemail@gmail.com
SMTP_PASSWORD=mygmailapppassword
HF_API_TOKEN=hf_yourHuggingFaceTokenHere
```

### Reference Commands

#### Build the entire stack
```bash
docker compose build
```
To force a clean rebuild without using cached layers:
```bash
docker compose build --no-cache
```

#### Launch the application stack
Launch all services in the background:
```bash
docker compose up -d
```

#### Monitor logs
View combined logs for all services in real time:
```bash
docker compose logs -f
```
View logs for the API service specifically:
```bash
docker compose logs -f backend
```

#### Stop services
Stop and remove container instances but keep persisted database volumes intact:
```bash
docker compose down
```
To stop containers and wipe volumes (destructive database wipe):
```bash
docker compose down -v
```

#### Shell access to running containers
Access the running backend container terminal:
```bash
docker exec -it phintra_backend sh
```
Access the running database console:
```bash
docker exec -it phintra_db psql -U postgres -d phintra
```

#### Local Cleanup
Prune unused container images, builds caches, and volumes to free up disk space:
```bash
docker system prune -a --volumes --force
```

---

## 2. Docker Image Optimization Analysis (Phase 9 Reference)

We have reduced the Docker bundle footprint significantly by employing multi-stage compilation pipelines.

### Size Comparison Estimates

| Service | Unoptimized Strategy Size (Monolithic) | Multi-Stage Optimized Strategy Size (Alpine/Nginx) | Reduction % |
| :--- | :--- | :--- | :--- |
| **Backend** | ~1.25 GB (`python:3.11` + compile caches + build tools) | **~195 MB** (`python:3.11-alpine` + clean wheels) | **84.4%** |
| **Frontend** | ~520 MB (Node runtime + `node_modules` + dev dependencies) | **~28 MB** (`nginx:alpine` + static HTML/JS/CSS assets) | **94.6%** |

### Optimization Techniques Applied
1. **Multi-Stage Discarding**:
   - *Backend*: GCC, musl-dev, and PostgreSQL development headers are installed only in the `builder` stage. The compilation wheels are transferred to a final run stage. The heavy dev compilers are discarded.
   - *Frontend*: Node.js container handles library compilation, and only the static compiled JavaScript output (`dist/`) is moved into the web server. The entire Node.js runtime and dev tools are discarded.
2. **Minimal Base Distribution**: Used Alpine Linux profiles for both services, reducing base container OS footprint from ~600MB (Debian) to ~5MB (Alpine).
3. **Optimized Layer Caching**: Ordered `COPY package*.json` and `COPY requirements.txt` before code transfer, ensuring package installations are only rerun when dependencies change.

---

## 3. Cloud Infrastructure Deployments (Phase 10 Reference)

### AWS Deployment Options

#### Option A: AWS ECS (Fargate)
AWS ECS on AWS Fargate is the recommended serverless container option.

1. **Push Images to AWS ECR**:
   ```bash
   # Log in to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com

   # Build, tag, and push backend
   docker build -t phintra-backend ./Phintra_Backend-main
   docker tag phintra-backend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/phintra-backend:latest
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/phintra-backend:latest

   # Build, tag, and push frontend
   docker build -t phintra-frontend ./Phintra_frontend-main --build-arg VITE_API_BASE_URL="https://api.yourdomain.com"
   docker tag phintra-frontend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/phintra-frontend:latest
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/phintra-frontend:latest
   ```
2. **Database Setup**: Deploy an Amazon RDS PostgreSQL database inside your private subnets.
3. **ECS Tasks Configuration**: Create ECS Task Definitions for frontend and backend. Set environment secrets inside AWS Secrets Manager or Parameter Store and bind them as ECS environment references.
4. **Deploy Application Services**: Bind an Application Load Balancer (ALB) routing path `/` to the frontend ECS service and path `/api/*` (or route subdomain `api.yourdomain.com`) to the backend service.

#### Option B: AWS EKS (Kubernetes)
For orchestrating with Kubernetes, use the following template configurations.

**`backend-deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: phintra-backend
  namespace: phintra
spec:
  replicas: 2
  selector:
    matchLabels:
      app: phintra-backend
  template:
    metadata:
      labels:
        app: phintra-backend
    spec:
      containers:
      - name: backend
        image: <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/phintra-backend:latest
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: database-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: secret-key
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "250m"
            memory: "256Mi"
```

**`frontend-deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: phintra-frontend
  namespace: phintra
spec:
  replicas: 2
  selector:
    matchLabels:
      app: phintra-frontend
  template:
    metadata:
      labels:
        app: phintra-frontend
    spec:
      containers:
      - name: frontend
        image: <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/phintra-frontend:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "200m"
            memory: "256Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
```

**`phintra-ingress.yaml`**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: phintra-ingress
  namespace: phintra
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
spec:
  rules:
  - host: app.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: phintra-frontend-service
            port:
              number: 80
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: phintra-backend-service
            port:
              number: 8001
```

---

### Azure Deployment Options

#### Option A: Azure Container Apps (ACA)
A low-maintenance, serverless hosting option.

1. **Deploy to Azure Container Registry (ACR)**:
   ```bash
   az acr login --name phintraregistry
   docker tag phintra-backend phintraregistry.azurecr.io/backend:v1
   docker push phintraregistry.azurecr.io/backend:v1
   ```
2. **Deploy via Azure CLI**:
   ```bash
   # Create container app environment
   az containerapp env create --name phintra-env --resource-group phintra-rg --location eastus

   # Create backend container app
   az containerapp create \
     --name phintra-api \
     --resource-group phintra-rg \
     --environment phintra-env \
     --image phintraregistry.azurecr.io/backend:v1 \
     --target-port 8001 \
     --ingress external \
     --secrets "db-url=secret-database-url-here,secret-key=secret-key-here" \
     --env-vars "DATABASE_URL=secretref:db-url,SECRET_KEY=secretref:secret-key"
   ```

#### Option B: Azure AKS (Kubernetes)
1. Provision Azure Kubernetes Service (AKS) using standard deployments.
2. Link ACR to AKS using:
   ```bash
   az aks update -n phintra-aks -g phintra-rg --attach-acr phintraregistry
   ```
3. Deploy manifests using `kubectl apply -f .` matching the YAML configurations above.
