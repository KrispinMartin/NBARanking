# Use the official R image
FROM rocker/r-ver:4.3.2

# Install system dependencies (for plumber + other R packages)
RUN apt-get update -qq && apt-get install -y \
  libcurl4-openssl-dev \
  libssl-dev \
  libxml2-dev \
  libgit2-dev \
  git \
  && apt-get clean

# Install R packages required for your API
RUN R -e "install.packages(c('plumber', 'jsonlite', 'readr', 'hoopR', 'moments', 'devtools'), repos='https://cloud.r-project.org/')"
RUN R -e "devtools::install_github('sportsdataverse/hoopR')"

# Copy all files from your repo into the Docker container
WORKDIR /app
COPY . /app

# Expose port 8080 to Render
EXPOSE 8080

# Run your plumber API
CMD ["R", "-e", "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8080)"]
