# Step 1: Use an official Node.js image as a base
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Expose the port that the application runs on (optional, but helpful)
EXPOSE 3000

# Step 7: Define the command to run the application
CMD ["npm", "start"]