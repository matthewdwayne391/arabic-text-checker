# Dockerfile للخدمة الرئيسية (Node.js API + الواجهة)
# يعمل مع خدمة LanguageTool المنفصلة عبر LT_API_URL
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port 5000 (التطبيق الرئيسي فقط)
EXPOSE 5000

# Start the API server only (بدون LanguageTool المحلي)
CMD ["npm", "run", "start:api-only"]