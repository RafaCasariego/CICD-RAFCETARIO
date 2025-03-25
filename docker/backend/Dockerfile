FROM python:3.12-slim

WORKDIR /app

COPY ./app/backend/ .

RUN pip install --no-cache-dir -r requirements.txt

# --- INYECCIÓN DEL DATABASE_URL ---
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]