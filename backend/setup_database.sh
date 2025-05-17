#!/bin/bash

# Install MySQL if not already installed
if ! command -v mysql &> /dev/null; then
    echo "Installing MySQL..."
    apt-get update
    apt-get install -y mysql-server
fi

# Start MySQL service
service mysql start

# Create database if it doesn't exist
mysql -e "CREATE DATABASE IF NOT EXISTS driving_school;"

# Create a user for the application (optional)
# mysql -e "CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'password';"
# mysql -e "GRANT ALL PRIVILEGES ON driving_school.* TO 'app_user'@'localhost';"
# mysql -e "FLUSH PRIVILEGES;"

echo "MySQL setup completed successfully."
