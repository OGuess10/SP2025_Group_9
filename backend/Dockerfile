# Use an official Python image as the base image
FROM python:3.13-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port the app runs on
EXPOSE 8000

# Set the default command to run the application
CMD ["flask", "run", "--host=0.0.0.0", "--port=8000"]