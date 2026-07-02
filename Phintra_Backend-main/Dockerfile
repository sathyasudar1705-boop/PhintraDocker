# ==========================================
# STAGE 1: Build dependencies and wheels
# ==========================================
FROM python:3.11-alpine AS builder

WORKDIR /build

# Install system build dependencies required for compiling Python extension packages (e.g. psycopg2-binary, bcrypt)
RUN apk add --no-cache gcc musl-dev postgresql-dev libffi-dev

COPY requirements.txt .

# Compile dependency packages into wheels for installation cache optimization
RUN pip install --no-cache-dir -r requirements.txt


# ==========================================
# STAGE 2: Minimal final runtime image
# ==========================================
FROM python:3.11-alpine

# Set system environment variables to prevent Python compiling byte-code and buffering console outputs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8001

WORKDIR /app

# Install runtime PostgreSQL client library and curl for health check execution
RUN apk add --no-cache libpq curl

# Copy compiled Python packages from the builder stage
COPY --from=builder /usr/local /usr/local
ENV PATH=/usr/local/bin:$PATH

# Copy backend source code to container
COPY . .

# Create a restricted system group and user to run the server without root access (least privilege access control)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE ${PORT}

# Run a container health check targeting the FastAPI index route every 30 seconds
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/ || exit 1

# Launch production server running migrations first
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
