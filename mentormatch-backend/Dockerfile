# FILE: Dockerfile

FROM python:3.12-slim AS builder

# 2. Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 3. Install System Dependencies (Required for building some Python packages)
# We clean them up immediately to save space
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 4. Install Dependencies
COPY requirements.txt .

# MAGIC STEP: Install Torch CPU *explicitly* first to ensure no GPU bloat creeps in
# We use --no-cache-dir to stop pip from saving a 1GB cache file inside the image
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install the rest
RUN pip install --no-cache-dir -r requirements.txt

# --- FINAL STAGE (The "Production" Image) ---
FROM python:3.12-slim

WORKDIR /app

# Copy installed packages from builder (Strips out GCC/Build tools)
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy Application Code
COPY . .

# Create a non-root user for security
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Expose Port
EXPOSE 8080

# Command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]