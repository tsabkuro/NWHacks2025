FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
#prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive


# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    bzip2 \
    libglib2.0-0 \
    libxext6 \
    libxrender-dev \
    libxtst6 \
    libssl-dev \
    ca-certificates \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Miniconda
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ]; then \
        wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-aarch64.sh -O /miniconda.sh; \
    else \
        wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O /miniconda.sh; \
    fi && \
    bash /miniconda.sh -b -p /opt/conda && \
    rm /miniconda.sh

# Add Conda to the PATH
ENV PATH="/opt/conda/bin:$PATH"

# Copy the environment.yml file into the container
COPY environment.yml environment.yml

RUN conda env create -f environment.yml && \
    conda clean -a && \
    rm environment.yml

# Activate the Conda environment by default
ENV PATH="/opt/conda/envs/financeApp/bin:$PATH"

# copy Django project to container
COPY . /backend/

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]