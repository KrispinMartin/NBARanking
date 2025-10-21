# Start with an R base image
FROM rocker/r-ver:4.3.2

# Install system dependencies (curl, etc)
RUN apt-get update -y && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev

# Install plumber and any extra R packages you use
RUN R -e "install.packages(c('plumber', 'jsonlite', 'dplyr', 'DBI', 'RSQLite'), repos='https://cloud.r-project.org/')"

# Copy your API files into the container
WORKDIR /app
COPY . /app

# Expose port for Render
EXPOSE 8080

# Run the Plumber API
CMD ["R", "-e", "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8080)"]
