#the an official node  runtime as a parent image
FROM node:carbon

# Set the working directory to /app
WORKDIR /usr/bin/node/ORM

# Copy the current directory contents into the container at /app
ADD . /usr/bin/node/ORM

# Install any needed packages specified in requirements.txt
RUN npm install 

# Make port 80 available to the world outside this container
EXPOSE 9000

# Define environment variable
ENV NAME Schema_Server
ENV ENV dev

# Run app.py when the container launches
CMD ["nodejs", "schema_server.js"]
