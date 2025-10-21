# Use official R image
FROM rocker/r-ver:4.3.1

# Install plumber and any dependencies
RUN R -e "install.packages(c('plumber', 'jsonlite', 'dplyr', 'tidyr', 'stringr', 'lubridate', 'readr'), repos='https://cloud.r-project.org/')"

# Set the working directory inside the container
WORKDIR /app

# Copy your R backend files into the container
COPY . /app

# Expose the port that Render will use
EXPOSE 8000

# Run your plumber API
CMD ["R", "-e", "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8000)"]
