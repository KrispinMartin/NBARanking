# Use the Plumber base image
FROM rocker/plumber:latest

# Install any R packages you need
RUN R -e "install.packages(c('dplyr', 'jsonlite', 'DBI', 'RSQLite'))"

# Copy your API
WORKDIR /app
COPY . /app

# Expose the port
EXPOSE 8080

# Run the API
CMD ["R", "-e", "pr <- plumber::plumb('plumber.R'); pr$run(host='0.0.0.0', port=8080)"]
