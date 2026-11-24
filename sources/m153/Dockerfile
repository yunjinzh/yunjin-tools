FROM python:3.12-slim-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg nodejs libgl1 libglib2.0-0 libgomp1 libportaudio2 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/requirements.txt /app/server/requirements.txt
RUN pip install --no-cache-dir --only-binary=:all: -r server/requirements.txt
COPY dist /app/dist
COPY server /app/server
RUN chmod -R a+rX /app/dist && useradd --create-home motion && mkdir -p /data && chown motion:motion /data
USER motion
ENV MOTION_HOST=0.0.0.0 PORT=8765 MOTION_JOBS=/data
VOLUME ["/data"]
EXPOSE 8765
CMD ["python","/app/server/service.py"]
