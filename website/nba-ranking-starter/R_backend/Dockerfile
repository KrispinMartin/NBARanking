# Use a modern R image
FROM rocker/r-ver:4.3.2

# Install system dependencies (needed for plumber and others)
RUN apt-get update -y && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    build-essential

# Install plumber and any other R packages you use
RUN R -e "install.packages(c('plumber', 'jsonlite', 'dplyr'), repos='https://cloud.r-project.org/')"

# Copy your API into the image
WORKDIR /app
COPY . /app

# Expose port 8080 for Render
EXPOSE 8080

# Run the API (your file is api.R)
CMD ["R", "-e", "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8080)"]
